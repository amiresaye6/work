const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Function to scrape product data for a given language
async function scrapeProductDataForLanguage(page, productUrl, language) {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 });



    // If the language is English, click the language switcher
    if (language === 'en') {
        await page.click('.switcher.language.switcher-language .view-en.switcher-option a');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    }

    // Extract product data
    const productData = await page.evaluate(() => {
        const name = document.querySelector('.page-title span')?.innerText || 'Unknown Product';

        // Check for regular price (old price) first
        const regularPriceElement = document.querySelector('.old-price .price-wrapper .price');
        // Check for single price (no discount)
        const singlePriceElement = document.querySelector('.price-container .price-wrapper .price');

        let price = 'N/A';
        if (regularPriceElement) {
            price = regularPriceElement.innerText;
        } else if (singlePriceElement) {
            price = singlePriceElement.innerText;
        }

        // Extract SKU from the data-sku attribute
        const skuElement = document.querySelector('.nahdi-promo-sku');
        const sku = skuElement ? skuElement.getAttribute('data-sku') : 'N/A';

        return {
            name,
            price,
            sku,
        };
    });

    return productData;
}

// Function to handle SKU mismatches
function handleSkuMismatch(mismatchData, outputFolder) {
    const mismatchFilePath = path.join(outputFolder, 'sku_mismatches.json');
    let mismatches = [];

    // Check if the file exists
    if (fs.existsSync(mismatchFilePath)) {
        // Read the existing mismatches
        mismatches = JSON.parse(fs.readFileSync(mismatchFilePath, 'utf-8'));
    }

    // Append the new mismatch
    mismatches.push(mismatchData);

    // Write the updated list back to the file
    fs.writeFileSync(mismatchFilePath, JSON.stringify(mismatches, null, 2));
    console.log(`SKU mismatch appended to ${mismatchFilePath}`);
}

// Function to save product data incrementally
function saveProductDataIncrementally(productData, outputFolder) {
    const jsonFilePath = path.join(outputFolder, 'sku_products.json');
    let existingData = [];

    // Check if the file exists
    if (fs.existsSync(jsonFilePath)) {
        // Read the existing data
        existingData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    }

    // Append the new product data
    existingData.push(productData);

    // Write the updated list back to the file
    fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2));
    console.log(`Product data saved incrementally to ${jsonFilePath}`);
}

// Function to save the current state (progress) of the process
function saveProcessState(index, outputFolder) {
    const stateFilePath = path.join(outputFolder, 'process_state.json');
    const state = { lastProcessedIndex: index };
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
    console.log(`Process state saved: Last processed index = ${index}`);
}

// Function to load the process state (progress)
function loadProcessState(outputFolder) {
    const stateFilePath = path.join(outputFolder, 'process_state.json');
    if (fs.existsSync(stateFilePath)) {
        const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
        return state.lastProcessedIndex;
    }
    return 0; // Start from the beginning if no state file exists
}

// Function to process products and generate JSON
async function processProducts(inputFilePath) {
    const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [`--window-size=${Math.floor(1920 * 0.7)},${Math.floor(1080 * 0.7)}`],
        defaultViewport: null,
    });

    const page = await browser.newPage();

    const outputFolder = path.join(__dirname, 'output');
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Load the last processed index
    let lastProcessedIndex = loadProcessState(outputFolder);

    for (let i = lastProcessedIndex; i < products.length; i++) {
        const product = products[i];
        console.log(`Processing ${i + 1}/${products.length}: ${product.url}`);

        try {
            // Scrape Arabic data
            const arabicData = await scrapeProductDataForLanguage(page, product.url, 'ar');

            // Scrape English data
            const englishData = await scrapeProductDataForLanguage(page, product.url, 'en');

            // Compare SKUs
            if (arabicData.sku !== englishData.sku) {
                // If SKUs don't match, add to mismatches
                handleSkuMismatch({
                    ar_url: product.url,
                    en_url: englishData.url,
                    ar_sku: arabicData.sku,
                    en_sku: englishData.sku
                }, outputFolder);
            }

            // Combine Arabic and English data
            const combinedData = {
                name: {
                    ar: arabicData.name,
                    en: englishData.name,
                },
                price: {
                    ar: arabicData.price,
                    en: englishData.price,
                },
                sku: {
                    ar: arabicData.sku,
                    en: englishData.sku,
                },
            };

            // Save product data incrementally
            saveProductDataIncrementally(combinedData, outputFolder);

            // Save the current process state
            saveProcessState(i, outputFolder);

        } catch (error) {
            console.error(`Failed to process product: ${product.url}`, error);
        }
    }

    await browser.close();
}

// Example usage
const inputFilePath = path.join(__dirname, 'output.json');
processProducts(inputFilePath);