const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
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

// Function to create folder structure based on ivitaCategoryEn
function createFolderStructure(ivitaCategoryEn) {
    const categories = ivitaCategoryEn[0].split(' > ').map(cat => sanitizeFilename(cat.trim()));
    const baseFolder = categories.slice(0, -1).join('/');
    const finalFolder = categories.join('_');
    return { baseFolder, finalFolder };
}

// Function to scrape product data for a given language
async function scrapeProductDataForLanguage(page, productUrl, language) {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout to 60 seconds

    // If the language is English, click the language switcher
    if (language === 'en') {
        await page.click('.switcher.language.switcher-language .view-en.switcher-option a');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout to 60 seconds
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
            // Use the regular price if it exists (discounted product)
            price = regularPriceElement.innerText;
        } else if (singlePriceElement) {
            // Use the single price if no discount is available
            price = singlePriceElement.innerText;
        }

        const descriptionElement = document.querySelector('.product.attribute.description .value');
        const description = descriptionElement ? descriptionElement.innerText : 'No description available';
        const shortDescription = document.querySelector('.product-info-main .breadcrumbs-category')?.innerText || 'No short description available';
        const images = [...new Set([...document.querySelectorAll('.fotorama__img')].map(img => img.src.split('?')[0]))];

        // Extract SKU from the data-sku attribute
        const skuElement = document.querySelector('.nahdi-promo-sku');
        const sku = skuElement ? skuElement.getAttribute('data-sku') : 'N/A';

        // Extract brand (الماركة)
        const brandElement = document.querySelector('.product.attribute.manufacturer .value');
        const brand = brandElement ? brandElement.innerText : 'N/A';

        return {
            name,
            price,
            description,
            shortDescription,
            images,
            sku,
            brand,
            url: window.location.href
        };
    });

    // Click on the "المواصفات" tab to reveal additional information
    await page.click('a#tab-label-specifications-tab-title');
    await page.waitForSelector('#specifications-tab', { visible: true, timeout: 120000 }); // Increased timeout to 60 seconds

    // Extract additional information from the "المواصفات" tab
    const additionalInfo = await page.evaluate(() => {
        const additionalInfoElements = document.querySelectorAll('#specifications-tab ul li');
        return Array.from(additionalInfoElements).map(el => el.innerText).join('\n');
    });

    // Add additional information to the product data
    productData.additionalInfo = additionalInfo;

    return productData;
}

// Function to handle failed products
function handleFailedProduct(failedProduct, outputFolder) {
    const failedProductsFilePath = path.join(outputFolder, 'failed_products.json');
    let failedProducts = {};

    // Check if the file exists
    if (fs.existsSync(failedProductsFilePath)) {
        // Read the existing failed products
        failedProducts = JSON.parse(fs.readFileSync(failedProductsFilePath, 'utf-8'));
    }

    // Initialize the "SKU mismatch ar, en" key if it doesn't exist
    if (!failedProducts["SKU mismatch ar, en"]) {
        failedProducts["SKU mismatch ar, en"] = [];
    }

    // Append the new failed product
    failedProducts["SKU mismatch ar, en"].push(failedProduct);

    // Write the updated list back to the file
    fs.writeFileSync(failedProductsFilePath, JSON.stringify(failedProducts, null, 2));
    console.log(`Failed product appended to ${failedProductsFilePath}`);
}

// Function to process products and generate JSON, CSV, and download images
async function processProducts(inputFilePath) {
    const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [`--window-size=${Math.floor(1920 * 0.7)},${Math.floor(1080 * 0.7)}`],
        defaultViewport: null,
    });

    const page = await browser.newPage();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`Processing ${i + 1}/${products.length}: ${product.url}`);

        let outputFolder; // Define outputFolder here to make it accessible in the catch block

        try {
            // Create folder structure based on ivitaCategoryEn
            const { baseFolder, finalFolder } = createFolderStructure(product.ivitaCategoryEn);
            outputFolder = path.join(__dirname, baseFolder, finalFolder);

            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputFolder)) {
                fs.mkdirSync(outputFolder, { recursive: true });
            }

            // Scrape Arabic data
            const arabicData = await scrapeProductDataForLanguage(page, product.url, 'ar');

            // Scrape English data by clicking the language switcher
            const englishData = await scrapeProductDataForLanguage(page, product.url, 'en');

            // Compare SKUs
            if (arabicData.sku !== englishData.sku) {
                // If SKUs don't match, add to failed products
                handleFailedProduct({
                    ar_url: product.url,
                    en_url: englishData.url,
                    ar_sku: arabicData.sku,
                    en_sku: englishData.sku
                }, outputFolder);
            }

            // Create a folder for the product
            const productFolder = path.join(outputFolder, sanitizeFilename(englishData.name));
            if (!fs.existsSync(productFolder)) {
                fs.mkdirSync(productFolder, { recursive: true });
            }

            // Combine Arabic and English data for JSON
            const combinedData = {
                ...arabicData,
                englishData,
                ivitaCategoryAr: product.ivitaCategoryAr,
                ivitaCategoryEn: product.ivitaCategoryEn
            };

            // Append JSON data to file
            const jsonFilePath = path.join(outputFolder, 'products.json');
            fs.appendFileSync(jsonFilePath, JSON.stringify(combinedData, null, 2) + ',\n');

            // Generate CSV data
            const csvData = {
                "SKU": arabicData.sku,
                "Name": arabicData.name,
                "Regular price": arabicData.price,
                "Categories": product.ivitaCategoryAr.join(' , '),
                "Images": arabicData.images.join(', '),
                "Attribute 1 name": "الماركة",
                "Attribute 1 value(s)": arabicData.brand,
                "Attribute 1 visible": 1,
                "Attribute 1 global": 1,
                "Attribute 2 name": "label",
                "Attribute 2 value(s)": "fast, verified",
                "Attribute 2 visible": 1,
                "Attribute 2 global": 1,
                "Description": arabicData.description.replace(/"/g, '""'),
            };

            // Append CSV data to file
            const csvFilePath = path.join(outputFolder, 'products.csv');
            const json2csvParser = new Parser({ quote: '' });
            const csv = json2csvParser.parse([csvData], { header: i === 0 }); // Write header only for the first product
            fs.appendFileSync(csvFilePath, csv + '\n');

            // Download images
            const imagePromises = arabicData.images.map(async (imageUrl, j) => {
                const imageUrlParts = imageUrl.split('/');
                const imageFilename = imageUrlParts[imageUrlParts.length - 1].split('?')[0];
                const indexedImageFilename = `${j.toString().padStart(2, '0')}_${imageFilename}`;
                const imagePath = path.join(productFolder, indexedImageFilename);

                try {
                    await downloadImage(imageUrl, imagePath);
                    console.log(`Downloaded image: ${imagePath}`);
                } catch (error) {
                    console.error(`Failed to download image: ${imageUrl}`, error);
                }
            });

            await Promise.all(imagePromises);

            // Create product details text file (English data)
            const productInfoFilePath = path.join(productFolder, `${sanitizeFilename(englishData.name)}.txt`);
            const productInfoContent = `Product Name: ${englishData.name}
Price: ${englishData.price}

=======================

SKU: ${englishData.sku}

=======================

Brand: ${englishData.brand}

=======================

Category: ${product.ivitaCategoryEn.join(' , ')}

=======================

Product URL: ${englishData.url}

=======================

Description:
${englishData.description}

Short Description:
${englishData.shortDescription}

Additional Information:
${englishData.additionalInfo}

`;

            fs.writeFileSync(productInfoFilePath, productInfoContent);

        } catch (error) {
            console.error(`Failed to process product: ${product.url}`, error);
            // Handle the failed product
            if (outputFolder) {
                handleFailedProduct(product, outputFolder);
            } else {
                console.error('Output folder is not defined. Skipping failed product handling.');
            }
        }
    }

    await browser.close();
}

module.exports = {
    processProducts
};