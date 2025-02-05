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
        const description = descriptionElement ? descriptionElement.innerText : 'No description available'; // Use innerText for plain text
        const shortDescription = document.querySelector('.product-info-main .breadcrumbs-category')?.innerText || 'No short description available'; // Use innerText for plain text
        const images = Array.from(document.querySelectorAll('.fotorama__img')).map(img => img.src);

        // Extract SKU from the data-sku attribute
        const skuElement = document.querySelector('.nahdi-promo-sku');
        const sku = skuElement ? skuElement.getAttribute('data-sku') : 'N/A';

        // Extract brand (الماركة)
        const brandElement = document.querySelector('.product.attribute.manufacturer .value');
        const brand = brandElement ? brandElement.innerText : 'N/A';

        // Extract category (الفئة)
        const categoryElement = document.querySelector('.breadcrumbs-category');
        const category = categoryElement ? categoryElement.innerText : 'N/A';

        return {
            name,
            price,
            description, // Plain text with new lines
            shortDescription, // Plain text with new lines
            images,
            sku,
            brand,
            category,
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

    return productData;
}

// Function to process a single product URL
async function processSingleProduct(productUrl, outputFile) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log(`Processing product: ${productUrl}`);

        // Scrape Arabic data
        const arabicData = await scrapeProductDataForLanguage(page, productUrl, 'ar');

        // Update URL to English
        const englishUrl = productUrl.replace('/ar/', '/en/');

        // Scrape English data
        const englishData = await scrapeProductDataForLanguage(page, englishUrl, 'en');

        // Combine Arabic and English data for JSON/CSV
        const combinedData = {
            "SKU": arabicData.sku,
            "Name": arabicData.name,
            "Regular price": arabicData.price,
            "Categories": arabicData.category,
            "Images": arabicData.images.join(', '), // Combine image URLs into a single string
            "Attribute 1 name": "الماركة",
            "Attribute 1 value(s)": arabicData.brand,
            "Attribute 1 visible": 1,
            "Attribute 1 global": 1,
            "Attribute 2 name": "label",
            "Attribute 2 value(s)": "fast, verified", // You can customize this
            "Attribute 2 visible": 1,
            "Attribute 2 global": 1,
            "Description": arabicData.description.replace(/"/g, '""'), // Escape double quotes
        };

        // Create product folder and download images
        const folderName = extractFolderNameFromUrl(productUrl);
        const sanitizedFolderName = sanitizeFilename(folderName);
        const productDir = path.join(__dirname, 'products', outputFile, sanitizedFolderName);

        // Create product directory if it doesn't exist
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }

        // Create product details text file (English data)
        const productInfoFilePath = path.join(productDir, `${sanitizedFolderName}_details.txt`);
        const productInfoContent = `Product Name: ${englishData.name}
Price: ${englishData.price}
SKU: ${englishData.sku}
Brand: ${englishData.brand}
Category: ${englishData.category}

Description:
${englishData.description}

Short Description:
${englishData.shortDescription}

Additional Information:
${englishData.additionalInfo}

Product URL: ${englishData.url}
`;

        fs.writeFileSync(productInfoFilePath, productInfoContent);

        // Download images
        const imagePromises = arabicData.images.map(async (imageUrl, j) => {
            const imageUrlParts = imageUrl.split('/');
            const imageFilename = imageUrlParts[imageUrlParts.length - 1].split('?')[0]; // Remove query parameters
            const indexedImageFilename = `${j.toString().padStart(2, '0')}_${imageFilename}`;
            const imagePath = path.join(productDir, indexedImageFilename);

            try {
                await downloadImage(imageUrl, imagePath);
                console.log(`Downloaded image: ${imagePath}`);
            } catch (error) {
                console.error(`Failed to download image: ${imageUrl}`, error);
            }
        });

        await Promise.all(imagePromises);

        // Save the combined data to a JSON file
        const jsonOutputPath = path.join(productDir, `${sanitizedFolderName}_data.json`);
        fs.writeFileSync(jsonOutputPath, JSON.stringify(combinedData, null, 2));
        console.log(`Product data saved to ${jsonOutputPath}`);

        // Save the combined data to a CSV file
        const csvOutputPath = path.join(productDir, `${sanitizedFolderName}_data.csv`);
        const json2csvParser = new Parser({ quote: '' }); // Disable outer quotes for the entire field
        const csv = json2csvParser.parse([combinedData]);
        fs.writeFileSync(csvOutputPath, csv);
        console.log(`Product data saved to ${csvOutputPath}`);
    } catch (error) {
        console.error(`Failed to process product: ${productUrl}`, error);
    } finally {
        await browser.close();
    }
}

// Run the script for a specific product URL
const productUrl = 'https://www.nahdionline.com/ar/bioserv-collajoy-drink-30-vial'; // Replace with your product URL
const outputFile = 'single_product_output'; // Base name for the output files
processSingleProduct(productUrl, outputFile);