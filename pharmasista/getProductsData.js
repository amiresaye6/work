const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function getProductData(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const productData = await page.evaluate(() => {
      console.log('Evaluating page content...');
      const breadcrumbElement = document.querySelector('div.my-4.hidden.text-xs.md\\:flex nav');
      const categories = breadcrumbElement
        ? Array.from(breadcrumbElement.querySelectorAll('li a')).map(item => item.textContent.trim())
        : ['Breadcrumb not found'];

      const productNameElement = document.querySelector('h1[data-badge="contentful"]');
      const productName = productNameElement
        ? productNameElement.textContent.trim()
        : 'Product name not found';

      const brandElement = document.querySelector('div.flex.items-center.space-x-2 a span span');
      const brand = brandElement
        ? brandElement.textContent.trim()
        : 'Brand not found';

      const sectionElement = document.querySelector('div.pdp-about-section');
      let description = '';

      if (sectionElement) {
        function processNode(node, indentLevel = 0) {
          let output = '';
          if (!node) return output;

          if (node.tagName === 'P' && node.querySelector('strong')) {
            const headerText = node.querySelector('strong').textContent.trim().replace(':', '');
            output += `${headerText}:\n`;
          } else if (node.tagName === 'P') {
            const text = node.textContent.trim();
            if (text && !node.querySelector('strong')) {
              output += `${text}\n`;
            }
          } else if (node.tagName === 'UL') {
            const items = node.querySelectorAll('li');
            items.forEach((li) => {
              const liText = li.textContent.trim();
              if (li.querySelector('strong') || liText.length < 50 && liText.includes(':')) {
                output += `:: ${liText}\n`;
              } else {
                output += `- ${liText}\n`;
              }
            });
          } else if (node.tagName === 'DIV') {
            const children = node.childNodes;
            children.forEach((child) => {
              if (child.nodeType === 1) {
                output += processNode(child, indentLevel);
              }
            });
          }
          return output;
        }

        const children = sectionElement.childNodes;
        children.forEach((child) => {
          if (child.nodeType === 1) {
            description += processNode(child);
          }
        });
      } else {
        description = 'Description section not found';
      }

      const images = [];
      let mainImageElement = null;
      const mainImageSelectors = [
        'div.h-\\\[400px\\\] img',
        'div.relative.aspect-square img',
        'div.lg\\:max-w-\\[427px\\] img'
      ];

      for (const selector of mainImageSelectors) {
        mainImageElement = document.querySelector(selector);
        console.log(`Trying main image selector: ${selector}, Found: ${!!mainImageElement}`);
        if (mainImageElement) break;
      }

      if (mainImageElement) {
        images.push(mainImageElement.src);
      } else {
        console.log('Main image not found with any selector');
      }

      const thumbnailElements = document.querySelectorAll('div.swiper-wrapper img');
      console.log(`Found ${thumbnailElements.length} thumbnail images`);
      thumbnailElements.forEach((img) => {
        if (!images.includes(img.src)) {
          images.push(img.src);
        }
      });

      return {
        success: true,
        data: {
          productName: productName,
          brand: brand,
          categories: categories,
          description: description.trim() || 'No description content found',
          images: images.length > 0 ? images : ['No images found']
        }
      };
    });

    await browser.close();
    return productData;
  } catch (error) {
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: {
        productName: 'An error occurred',
        brand: 'An error occurred',
        categories: ['An error occurred'],
        description: 'An error occurred',
        images: ['An error occurred']
      }
    };
  }
}

async function processProducts() {
  try {
    // Read the input JSON file
    const jsonData = await fs.readFile('العناية_بالبشرة/أدوات_العناية_بالبشرة_إلكترونية.json', 'utf8');
    const products = JSON.parse(jsonData);

    // Load existing results, progress, and failed products
    let result = [];
    let processedProductIds = new Set();
    let failedProducts = [];
    const outputFile = 'combined_product_data.json';
    const progressFile = 'progress.json';
    const failedFile = 'failed_products.json';

    try {
      const existingData = await fs.readFile(outputFile, 'utf8');
      result = JSON.parse(existingData);
      processedProductIds = new Set(result.map(product => product.productId));
      console.log(`Loaded ${result.length} existing products from ${outputFile}`);
    } catch (error) {
      console.log('No existing output file found, starting fresh.');
    }

    try {
      const progressData = await fs.readFile(progressFile, 'utf8');
      const progress = JSON.parse(progressData);
      processedProductIds = new Set([...processedProductIds, ...progress.processedProductIds]);
      console.log(`Loaded progress with ${processedProductIds.size} processed products`);
    } catch (error) {
      console.log('No progress file found, starting fresh.');
    }

    try {
      const failedData = await fs.readFile(failedFile, 'utf8');
      failedProducts = JSON.parse(failedData);
      console.log(`Loaded ${failedProducts.length} failed products from ${failedFile}`);
    } catch (error) {
      console.log('No failed products file found, starting fresh.');
    }

    // Process each product
    for (const product of products) {
      const productId = product.productId;

      // Skip non-express products
      if (!product.isExpress) {
        console.log(`Skipping non-express product: ${productId}`);
        continue;
      }

      // Find existing product in result, if any
      const existingProductIndex = result.findIndex(p => p.productId === productId);
      let combinedData;

      if (existingProductIndex !== -1 && processedProductIds.has(productId)) {
        // Product already fully processed, update categories only
        console.log(`Updating categories for already processed product: ${productId}`);
        combinedData = result[existingProductIndex];

        // Build category path from JSON data
        const jsonCategoryPathAr = [product.main_category, product.sub_category].filter(Boolean);
        const jsonCategoryPathEn = combinedData.categories_en[0] || []; // Use existing English categories as fallback

        // Add new category paths if not already present
        if (jsonCategoryPathAr.length > 0 && !combinedData.categories_ar.some(path => path.join(' > ') === jsonCategoryPathAr.join(' > '))) {
          combinedData.categories_ar.push(jsonCategoryPathAr);
        }
        if (jsonCategoryPathEn.length > 0 && !combinedData.categories_en.some(path => path.join(' > ') === jsonCategoryPathEn.join(' > '))) {
          combinedData.categories_en.push(jsonCategoryPathEn);
        }

        // Update main and subcategories
        combinedData.main_categories_ar = [...new Set(combinedData.categories_ar.map(path => path[0]).filter(Boolean))];
        combinedData.main_categories_en = [...new Set(combinedData.categories_en.map(path => path[0]).filter(Boolean))];
        combinedData.sub_categories_ar = [...new Set(combinedData.categories_ar.map(path => path[path.length - 1]).filter(Boolean))];
        combinedData.sub_categories_en = [...new Set(combinedData.categories_en.map(path => path[path.length - 1]).filter(Boolean))];
      } else {
        // New or partially processed product
        const arUrl = product.url;
        const enUrl = arUrl.replace('ar-sa', 'en-sa');

        console.log(`Processing Arabic URL: ${arUrl}`);
        const arData = await getProductData(arUrl);

        console.log(`Processing English URL: ${enUrl}`);
        const enData = await getProductData(enUrl);

        // Check for errors in either scrape
        if (!arData.success || !enData.success) {
          const failedEntry = {
            productId: productId,
            url_ar: arUrl,
            url_en: enUrl,
            error: {
              ar: arData.success ? null : arData.error,
              en: enData.success ? null : enData.error
            },
            timestamp: new Date().toISOString()
          };
          failedProducts.push(failedEntry);
          await fs.writeFile(failedFile, JSON.stringify(failedProducts, null, 2));
          console.log(`Logged failure for product ${productId} to ${failedFile}`);
          continue; // Skip to next product
        }

        // Build category path from JSON data
        // const jsonCategoryPathAr = [product.main_category, product.sub_category].filter(Boolean);

        // Combine data
        combinedData = {
          productId: productId,
          title_ar: product.title,
          title_en: enData.data.productName,
          url_ar: arUrl,
          url_en: enUrl,
          imageUrl: product.imageUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          isExpress: product.isExpress,
          position: product.position,
          brand_ar: arData.data.brand,
          brand_en: enData.data.brand,
          categories_ar: [arData.data.categories].filter(path => path.length > 0),
          categories_en: [enData.data.categories].filter(path => path.length > 0),
          main_categories_ar: [...new Set([arData.data.categories[1]].filter(Boolean))],
          main_categories_en: [...new Set([enData.data.categories[1]].filter(Boolean))],
          sub_categories_ar: [...new Set([arData.data.categories[arData.data.categories.length - 1]].filter(Boolean))],
          sub_categories_en: [...new Set([enData.data.categories[enData.data.categories.length - 1]].filter(Boolean))],
          description_ar: arData.data.description,
          description_en: enData.data.description,
          images: arData.data.images
        };

        // Add or update result
        if (existingProductIndex !== -1) {
          result[existingProductIndex] = combinedData;
        } else {
          result.push(combinedData);
        }

        // Mark as processed
        processedProductIds.add(productId);
      }

      // Save results and progress
      await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
      await fs.writeFile(progressFile, JSON.stringify({ processedProductIds: Array.from(processedProductIds) }, null, 2));
      console.log(`Saved data for product ${productId} to ${outputFile} and updated ${progressFile}`);
    }

    console.log('Processing complete. All data saved to combined_product_data.json');
    return result;
  } catch (error) {
    console.error('Error processing products:', error);
    // Save current progress and failed products
    await fs.writeFile(progressFile, JSON.stringify({ processedProductIds: Array.from(processedProductIds) }, null, 2));
    await fs.writeFile(failedFile, JSON.stringify(failedProducts, null, 2));
    return result;
  }
}

// Run the script
(async () => {
  const result = await processProducts();
  if (result) {
    return;
  };
})();