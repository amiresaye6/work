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

// Main function to scrape product data and download images
async function scrapeProductData(productUrl, index) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    // Extract product data
    const productData = await page.evaluate(() => {
        const name = document.querySelector('.page-title span')?.innerText || 'Unknown Product';
        const price = document.querySelector('.price-wrapper .price')?.innerText || 'N/A';
        const description = document.querySelector('.product.attribute.description .value')?.innerText || 'No description available';
        const images = Array.from(document.querySelectorAll('.fotorama__img')).map(img => img.src);
        
        // Try to get additional details
        const sku = document.querySelector('.product.attribute.sku .value')?.innerText || 'N/A';

        return { 
            name, 
            price, 
            description, 
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
        const additionalInfoElements = document.querySelectorAll('#specifications-tab ul li');
        return Array.from(additionalInfoElements).map(el => el.innerText).join('\n');
    });

    // Add additional information to the product data
    productData.additionalInfo = additionalInfo;

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
    const productInfoContent = `Product Name: ${productData.name}
Price: ${productData.price}
SKU: ${productData.sku}

Description:
${productData.description}

${productData.additionalInfo}

Product URL: ${productData.url}
`;

    fs.writeFileSync(productInfoFilePath, productInfoContent);

    // Download images with the same name as they would have if saved manually
    const imagePromises = productData.images.map(async (imageUrl, i) => {
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

    return productData;
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

// Example usage
(async () => {
    const limit = 3; // Set the limit of products to process
    const results = await processProducts('products.json', limit);
    // console.log(results);
})();