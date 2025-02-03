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
        const additionalInfo = Array.from(document.querySelectorAll('.additional-attributes .item'))
            .map(item => `${item.querySelector('.label')?.innerText}: ${item.querySelector('.value')?.innerText}`)
            .join('\n');

        return { 
            name, 
            price, 
            description, 
            images, 
            sku,
            additionalInfo,
            url: window.location.href 
        };
    });

    // Sanitize product name for directory and file creation
    const sanitizedProductName = sanitizeFilename(productData.name);
    const productDir = path.join(__dirname, 'products', sanitizedProductName);

    // Create product directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }

    // Create product details text file
    const productInfoFilePath = path.join(productDir, `${sanitizedProductName}_details.txt`);
    const productInfoContent = `Product Name: ${productData.name}
Price: ${productData.price}
SKU: ${productData.sku}

Description:
${productData.description}

Additional Information:
${productData.additionalInfo}

Product URL: ${productData.url}
`;

    fs.writeFileSync(productInfoFilePath, productInfoContent);

    // Download images
    const imagePromises = productData.images.map(async (imageUrl, i) => {
        const imageFilename = `${sanitizedProductName}-${i.toString().padStart(2, '0')}.jpg`;
        const imagePath = path.join(productDir, imageFilename);

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
    console.log(results);
})();