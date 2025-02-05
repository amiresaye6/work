const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to sanitize filenames
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Replace special characters with underscores
}

// Function to download images
async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        responseType: 'stream',
    });
    return new Promise((resolve, reject) => {
        response.data
            .pipe(fs.createWriteStream(filepath))
            .on('finish', () => resolve())
            .on('error', e => reject(e));
    });
}

// Function to extract folder name from URL
function extractFolderNameFromUrl(url) {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1]; // Get the last part of the URL
}

// Function to scrape product data for a given language
async function scrapeProductDataForLanguage(page, productUrl, language) {
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    // Extract product data
    const productData = await page.evaluate(() => {
        const name = document.querySelector('.page-title span')?.innerText || 'Unknown Product';
        const price = document.querySelector('.price-wrapper .price')?.innerText || 'N/A';
        const descriptionElement = document.querySelector('.product.attribute.description .value');
        const description = descriptionElement ? descriptionElement.innerHTML : 'No description available';
        const shortDescriptionElement = document.querySelector('.product-info-main .breadcrumbs-category');
        const shortDescription = shortDescriptionElement ? shortDescriptionElement.innerHTML : 'No short description available';
        const images = Array.from(document.querySelectorAll('.fotorama__img')).map(img => img.src);

        // Extract SKU from the data-sku attribute
        const skuElement = document.querySelector('.nahdi-promo-sku');
        const sku = skuElement ? skuElement.getAttribute('data-sku') : 'N/A';

        return {
            name,
            price,
            description,
            shortDescription,
            images,
            sku,
            url: window.location.href
        };
    });

    // Click on the "المواصفات" tab to reveal additional information
    await page.click('a#tab-label-specifications-tab-title');
    await page.waitForSelector('#specifications-tab', { visible: true });

    // Extract additional information from the "المواصفات" tab
    const additionalInfo = await page.evaluate(() => {
        const additionalInfoElement = document.querySelector('#specifications-tab');
        return additionalInfoElement ? additionalInfoElement.innerHTML : 'No additional information available';
    });

    // Add additional information to the product data
    productData.additionalInfo = additionalInfo;

    return productData;
}

// Main function to scrape product data and download images
async function scrapeProductData(productUrl, index) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Scrape Arabic data
    const arabicData = await scrapeProductDataForLanguage(page, productUrl, 'ar');

    // Update URL to English
    const englishUrl = productUrl.replace('/ar/', '/en/');

    // Scrape English data
    const englishData = await scrapeProductDataForLanguage(page, englishUrl, 'en');

    // Extract folder name from URL
    const folderName = extractFolderNameFromUrl(productUrl);
    const sanitizedFolderName = sanitizeFilename(folderName);

    // Add index to the folder name
    const indexedFolderName = `${index.toString().padStart(2, '0')}_${sanitizedFolderName}`;
    const productDir = path.join(__dirname, 'products', indexedFolderName);

    // Create product directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }

    // Create product details text file
    const productInfoFilePath = path.join(productDir, `${indexedFolderName}_details.txt`);
    const productInfoContent = `Product Name (Arabic): ${arabicData.name}
Product Name (English): ${englishData.name}
Price (Arabic): ${arabicData.price}
Price (English): ${englishData.price}
SKU (Arabic): ${arabicData.sku}
SKU (English): ${englishData.sku}

Description (Arabic - Text):
${arabicData.description.replace(/<[^>]+>/g, '')}

Description (English - Text):
${englishData.description.replace(/<[^>]+>/g, '')}

Short Description (Arabic - Text):
${arabicData.shortDescription.replace(/<[^>]+>/g, '')}

Short Description (English - Text):
${englishData.shortDescription.replace(/<[^>]+>/g, '')}

Description (Arabic - HTML):
${arabicData.description}

Description (English - HTML):
${englishData.description}

Short Description (Arabic - HTML):
${arabicData.shortDescription}

Short Description (English - HTML):
${englishData.shortDescription}

Additional Information (Arabic):
${arabicData.additionalInfo}

Additional Information (English):
${englishData.additionalInfo}

Product URL (Arabic): ${arabicData.url}
Product URL (English): ${englishData.url}
`;

    fs.writeFileSync(productInfoFilePath, productInfoContent);

    // Download images with the same name as they would have if saved manually
    const imagePromises = arabicData.images.map(async (imageUrl, i) => {
        // Extract the image filename from the URL
        const imageUrlParts = imageUrl.split('/');
        const imageFilename = imageUrlParts[imageUrlParts.length - 1].split('?')[0]; // Remove query parameters
        const indexedImageFilename = `${i.toString().padStart(2, '0')}_${imageFilename}`;
        const imagePath = path.join(productDir, indexedImageFilename);

        try {
            await downloadImage(imageUrl, imagePath);
            console.log(`Downloaded image: ${imagePath}`);
        } catch (error) {
            console.error(`Failed to download image: ${imageUrl}`, error);
        }
    });

    await Promise.all(imagePromises);
    await browser.close();

    return { arabicData, englishData };
}

// Function to process products with a limit and create a master JSON
async function processProducts(jsonFilePath, limit) {
    const products = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    const results = [];

    // Ensure products directory exists
    const productsDir = path.join(__dirname, 'products');
    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    for (let i = 0; i < Math.min(limit, products.length); i++) {
        const product = products[i];
        console.log(`Processing ${i + 1}/${limit}: ${product.name}`);
        try {
            const data = await scrapeProductData(product.url, i);
            results.push(data);
        } catch (error) {
            console.error(`Failed to process product: ${product.name}`, error);
        }
    }

    // Create a master JSON file with all product data
    const masterJsonPath = path.join(__dirname, 'products', 'master_products.json');
    fs.writeFileSync(masterJsonPath, JSON.stringify(results, null, 2));
    console.log(`Master product data saved to ${masterJsonPath}`);

    return results;
}

module.exports = { processProducts };