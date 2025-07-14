const puppeteer = require('puppeteer');
const fs = require('fs').promises;

let counter = 0;

/**
 * Scrapes detailed product information from a given Nahdi URL.
 * @param {string} url The URL of the product page to scrape.
 * @returns {Promise<object>} A promise that resolves to the scraped data.
 */
async function getProductData(url, browser) {
  let page;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout

    const productData = await page.evaluate(() => {
      // Helper to select an element and get its text content safely
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : 'Not Found';
      };

      // --- Scrape all data points directly from the page ---

      // Scrape Breadcrumb Categories
      const breadcrumbElement = document.querySelector('div.my-4.hidden.text-xs.md\\:flex nav');
      const categories = breadcrumbElement
        ? Array.from(breadcrumbElement.querySelectorAll('li a')).map(item => item.textContent.trim())
        : ['Category breadcrumb not found'];

      // Scrape Product Name
      const productName = getText('h1[data-badge="contentful"]');

      // Scrape Brand
      const brand = getText('div.flex.items-center.space-x-2 a span span');

      // Scrape Description
      const sectionElement = document.querySelector('div.pdp-about-section');
      let description = 'Description section not found';
      if (sectionElement) {
        // This simplified logic just gets all the text content from the description section.
        // You can restore your complex processNode function here if needed.
        description = sectionElement.innerText.trim();
      }

      // Scrape Images
      const images = new Set(); // Use a Set to avoid duplicate images
      // Main image
      const mainImageElement = document.querySelector('div.relative.aspect-square img.object-contain');
      if (mainImageElement && mainImageElement.src) {
        images.add(mainImageElement.src);
      }
      // Thumbnail images
      const thumbnailElements = document.querySelectorAll('div.swiper-wrapper img');
      thumbnailElements.forEach(img => {
        if (img.src) {
          images.add(img.src);
        }
      });

      return {
        success: true,
        data: {
          productName: productName,
          brand: brand,
          categories: categories.length > 1 ? categories.slice(1) : categories, // Remove "Home"
          description: description,
          images: Array.from(images)
        }
      };
    });

    await page.close();
    return productData;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    if (page) await page.close();
    return {
      success: false,
      error: error.message,
      data: {} // Return empty data object on failure
    };
  }
}

/**
 * Main function to process the matched products file.
 * @param {string} inputFileName The name of the JSON file from the Python script.
 */
async function processMatchedProducts(inputFileName) {
  // --- 1. Load Input and State Files ---
  let matchedProducts = [];
  try {
    const jsonData = await fs.readFile(inputFileName, 'utf8');
    matchedProducts = JSON.parse(jsonData);
  } catch (error) {
    console.error(`❌ Critical Error: Could not read input file "${inputFileName}". Halting execution.`);
    return;
  }

  const outputFile = 'scraped_product_details.json';
  const progressFile = 'progress.json';
  const failedFile = 'failed_products.json';

  let finalResults = [];
  let processedProductIds = new Set();
  let failedProducts = [];

  try {
    finalResults = JSON.parse(await fs.readFile(outputFile, 'utf8'));
    processedProductIds = new Set(finalResults.map(p => p.productId));
    console.log(`Loaded ${finalResults.length} existing results from ${outputFile}.`);
  } catch (e) {
    console.log('No existing output file found. Starting a new one.');
  }

  try {
    const progressData = JSON.parse(await fs.readFile(progressFile, 'utf8'));
    processedProductIds = new Set([...processedProductIds, ...progressData.processedProductIds]);
    console.log(`Loaded progress. Total processed products to skip: ${processedProductIds.size}.`);
  } catch (e) {
    console.log('No progress file found.');
  }
  try {
    failedProducts = JSON.parse(await fs.readFile(failedFile, 'utf8'));
    console.log(`Loaded ${failedProducts.length} previously failed products.`);
  } catch (e) {
    console.log('No failed products file found.');
  }


  console.log(`\nFound ${matchedProducts.length} matched pairs to process.`);
  const browser = await puppeteer.launch({ headless: true });

  // --- 2. Process Each Matched Product ---
  for (const match of matchedProducts) {
    const nahdiProduct = match;

    const productId = nahdiProduct.productId;

    // Skip if already processed
    if (processedProductIds.has(productId)) {
      console.log(`⏭️ Skipping already processed product: ${productId}`);
      continue;
    }

    const enUrl = nahdiProduct.url.includes('/en-sa/')
      ? nahdiProduct.url
      : nahdiProduct.url.replace('/ar-sa/', '/en-sa/');
    const arUrl = enUrl.replace('/en-sa/', '/ar-sa/');

    console.log(`\nProcessing Product ID: ${productId}`);
    console.log(`EN URL: ${enUrl}`);
    const enData = await getProductData(enUrl, browser);

    console.log(`AR URL: ${arUrl}`);
    const arData = await getProductData(arUrl, browser);

    // --- 3. Handle Failures ---
    if (!enData.success || !arData.success) {
      const failureLog = {
        productId: productId,
        url_en: enUrl,
        url_ar: arUrl,
        error: {
          en: enData.error || null,
          ar: arData.error || null,
        },
        timestamp: new Date().toISOString()
      };
      failedProducts.push(failureLog);
      await fs.writeFile(failedFile, JSON.stringify(failedProducts, null, 2));
      console.error(`❌ Failed to scrape data for ${productId}. Logged to ${failedFile}.`);
      continue; // Move to the next product
    }

    // --- 4. Combine Scraped Data ---
    const combinedData = {
      productId: productId,
      url_en: enUrl,
      url_ar: arUrl,
      title_en: enData.data.productName,
      title_ar: arData.data.productName,
      brand_en: enData.data.brand,
      brand_ar: arData.data.brand,
      categories_en: enData.data.categories,
      categories_ar: arData.data.categories,
      description_en: enData.data.description,
      description_ar: arData.data.description,
      // Use English images as the primary source, as they are usually higher quality
      images: enData.data.images.length > 0 ? arData.data.images : enData.data.images,
      // Include original pricing info from the JSON for reference
      priceInfo: {
        price: nahdiProduct.price,
        originalPrice: nahdiProduct.originalPrice,
        discount: nahdiProduct.discount,
      },
    };

    finalResults.push(combinedData);
    processedProductIds.add(productId);

    // --- 5. Save Progress Periodically ---
    await fs.writeFile(outputFile, JSON.stringify(finalResults, null, 2));
    await fs.writeFile(progressFile, JSON.stringify({ processedProductIds: Array.from(processedProductIds) }, null, 2));
    console.log(`✅ Successfully saved data for product ${productId}. index: ${++counter}`);
  }

  await browser.close();
  console.log('\n🚀 Processing complete. All data saved.');
}

// --- Script Execution ---
(async () => {
  // The input file is the output from your Python script
  await processMatchedProducts("deduplicated_products.json");
})();