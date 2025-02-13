const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const axios = require('axios');
const readline = require('readline');

// Helper function to introduce delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Function to scrape product names and URLs
async function scrapeProducts(start, end, baseUrl, outputFile) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const products = [];

    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        const url = `${baseUrl}&page=${pageNumber}`;
        console.log(`Scraping page ${pageNumber}: ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2' });
        await delay(1000); // Delay after loading the page

        await page.waitForSelector('li.ais-Hits-item');
        await delay(1000); // Delay after the product list loads

        const pageProducts = await page.evaluate(() => {
            const productElements = document.querySelectorAll('li.ais-Hits-item');
            const products = [];

            productElements.forEach((product) => {
                const hubstoreLabel = product.querySelector('span.label-Hubstore');
                if (hubstoreLabel) {
                    const productName = product.querySelector('h3.result-title a')?.innerText.trim();
                    const productUrl = product.querySelector('h3.result-title a')?.href;

                    products.push({
                        name: productName,
                        url: productUrl,
                    });
                }
            });

            return products;
        });

        products.push(...pageProducts);
        await delay(2000); // Delay before navigating to the next page
    }

    await browser.close();

    // Save the scraped data to a JSON file
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    console.log(`Scraped data saved to ${outputFile}`);

    return products;
}

// Function to scrape product data for a given language
async function scrapeProductDataForLanguage(page, productUrl, language) {
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    const productData = await page.evaluate(() => {
        const name = document.querySelector('.page-title span')?.innerText || 'Unknown Product';
        const price = document.querySelector('.price-wrapper .price')?.innerText || 'N/A';
        const descriptionElement = document.querySelector('.product.attribute.description .value');
        const description = descriptionElement ? descriptionElement.innerText : 'No description available';
        const shortDescription = document.querySelector('.product-info-main .breadcrumbs-category')?.innerText || 'No short description available';
        const images = Array.from(document.querySelectorAll('.fotorama__img')).map(img => img.src);

        const skuElement = document.querySelector('.nahdi-promo-sku');
        const sku = skuElement ? skuElement.getAttribute('data-sku') : 'N/A';

        const brandElement = document.querySelector('.product.attribute.manufacturer .value');
        const brand = brandElement ? brandElement.innerText : 'N/A';

        const categoryElement = document.querySelector('.breadcrumbs-category');
        const category = categoryElement ? categoryElement.innerText : 'N/A';

        return {
            name,
            price,
            description,
            shortDescription,
            images,
            sku,
            brand,
            category,
            url: window.location.href,
        };
    });

    await page.click('a#tab-label-specifications-tab-title');
    await page.waitForSelector('#specifications-tab', { visible: true });

    const additionalInfo = await page.evaluate(() => {
        const additionalInfoElements = document.querySelectorAll('#specifications-tab ul li');
        return Array.from(additionalInfoElements).map(el => el.innerText).join('\n');
    });

    productData.additionalInfo = additionalInfo;

    return productData;
}

// Function to process products and generate JSON, CSV, and download images
async function processProducts(inputFilePath, outputFolder) {
    const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));
    const results = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Ensure the output folder exists
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`Processing ${i + 1}/${products.length}: ${product.url}`);
        try {
            const arabicData = await scrapeProductDataForLanguage(page, product.url, 'ar');
            const englishUrl = product.url.replace('/ar/', '/en/');
            const englishData = await scrapeProductDataForLanguage(page, englishUrl, 'en');

            const combinedData = {
                "SKU": arabicData.sku,
                "Name": arabicData.name,
                "Regular price": arabicData.price,
                "Categories": arabicData.category,
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

            results.push(combinedData);

            const folderName = extractFolderNameFromUrl(product.url);
            const sanitizedFolderName = sanitizeFilename(folderName);
            const indexedFolderName = `${i.toString().padStart(2, '0')}_${sanitizedFolderName}`;
            const productDir = path.join(outputFolder, indexedFolderName);

            if (!fs.existsSync(productDir)) {
                fs.mkdirSync(productDir, { recursive: true });
            }

            const productInfoFilePath = path.join(productDir, `${indexedFolderName}_details.txt`);
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

            const imagePromises = arabicData.images.map(async (imageUrl, j) => {
                const imageUrlParts = imageUrl.split('/');
                const imageFilename = imageUrlParts[imageUrlParts.length - 1].split('?')[0];
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
        } catch (error) {
            console.error(`Failed to process product: ${product.url}`, error);
        }
    }

    await browser.close();

    const jsonOutputPath = path.join(outputFolder, 'products_output.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(results, null, 2));
    console.log(`Product data saved to ${jsonOutputPath}`);

    const csvOutputPath = path.join(outputFolder, 'products_output.csv');
    const json2csvParser = new Parser({ quote: '' });
    const csv = json2csvParser.parse(results);
    fs.writeFileSync(csvOutputPath, csv);
    console.log(`Product data saved to ${csvOutputPath}`);

    return results;
}

// Function to prompt user for input
function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Main function to run the script
async function main() {
    const baseUrl = await promptUser('Enter the first URL to scrape: ');
    const startPage = parseInt(await promptUser('Enter the start page number: '), 10);
    const endPage = parseInt(await promptUser('Enter the end page number: '), 10);
    const outputFolder = await promptUser('Enter the output folder name: ');

    const linksOutputFile = path.join(outputFolder, 'products_links.json');
    await scrapeProducts(startPage, endPage, baseUrl, linksOutputFile);

    await processProducts(linksOutputFile, outputFolder);
}

// Run the script
main();

// // Main function to run the script
// async function main() {
//     const baseUrl = await promptUser('Enter the first URL to scrape: ');
//     const startPage = parseInt(await promptUser('Enter the start page number: '), 1);
//     const endPage = parseInt(await promptUser('Enter the end page number: '), 10);
//     const outputFolder = baseUrl.split(/nahdionline\.com\/(?:ar|en)\//)[1].replace(/\//g, "_");

//     const outPath = path.join(__dirname, 'products', outputFolder);
//     console.log('\n\n\x1b[32m%s\x1b[0m', `The output folder will be ${outPath} \n\n`);

//     if (!fs.existsSync(outPath)) {
//         fs.mkdirSync(outPath, { recursive: true });
//     }

//     const linksOutputFile = path.join(outPath, 'products_links.json');

//     await scrapeProducts(startPage, endPage, baseUrl, linksOutputFile);

//     await processProducts(linksOutputFile, outputFolder);
// }

// // Run the script
// main();