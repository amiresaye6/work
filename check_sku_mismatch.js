const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Function to extract SKU from a product page
async function extractSku(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract SKU from the page
    const sku = await page.evaluate(() => {
        const skuElement = document.querySelector('.nahdi-promo-sku');
        return skuElement ? skuElement.getAttribute('data-sku') : null;
    });

    return sku;
}

// Function to check for SKU mismatches
async function checkSkuMismatch(inputFilePath, outputFilePath) {
    // Read the input JSON file
    const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

    // Initialize an array to store mismatched products
    const mismatchedProducts = [];

    // Launch a browser instance
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Loop through each product URL
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`Processing ${i + 1}/${products.length}: ${product.url}`);

        try {
            // Extract Arabic SKU
            const arSku = await extractSku(page, product.url);

            // Update URL to English
            const englishUrl = product.url.replace('/ar/', '/en/');

            // Extract English SKU
            const enSku = await extractSku(page, englishUrl);

            // Check if SKUs don't match
            if (arSku !== enSku) {
                mismatchedProducts.push({
                    ar_url: product.url,
                    en_url: englishUrl,
                    ar_sku: arSku,
                    en_sku: enSku
                });
                console.log(`SKU mismatch found for: ${product.url}`);
            }
        } catch (error) {
            console.error(`Failed to process product: ${product.url}`, error);
        }
    }

    // Close the browser
    await browser.close();

    // Write the mismatched products to the output JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify({ "SKU mismatch ar, en": mismatchedProducts }, null, 2));
    console.log(`SKU mismatches saved to ${outputFilePath}`);
}

// File paths
const inputFilePath = path.join(__dirname, 'vitamins-supplements_children-s-healthLinks.json'); // Input JSON file with URLs
const outputFilePath = path.join(__dirname, 'sku_mismatches.json'); // Output JSON file for mismatches

// Run the SKU mismatch check
checkSkuMismatch(inputFilePath, outputFilePath);