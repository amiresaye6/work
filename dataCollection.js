const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper function to introduce delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads the existing JSON file or initializes an empty array if the file doesn't exist.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Array} - The parsed data from the JSON file or an empty array.
 */
const readOrInitializeJsonFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
};

/**
 * Extracts the category path from the breadcrumb navigation.
 * @param {Object} page - The Puppeteer page object.
 * @returns {string} - The category path as a string.
 */
const extractCategoryPath = async (page) => {
    const breadcrumbs = await page.$$eval('ul.items li.item', items => {
        return items.map(item => {
            const anchor = item.querySelector('a');
            const strong = item.querySelector('strong');
            return anchor ? anchor.innerText.trim() : strong.innerText.trim();
        });
    });

    // Ignore the first element (Home)
    return breadcrumbs.slice(1).join(' > ');
};

/**
 * Extracts the last page number from the pagination element.
 * @param {Object} page - The Puppeteer page object.
 * @returns {number} - The last page number.
 */
const extractLastPageNumber = async (page) => {
    try {
        // Wait for the pagination element to load
        await page.waitForSelector('li.ais-Pagination-item--lastPage a.ais-Pagination-link', { timeout: 5000 });

        // Extract the last page number from the href attribute
        const lastPageNumber = await page.$eval('li.ais-Pagination-item--lastPage a.ais-Pagination-link', link => {
            const href = link.getAttribute('href');
            const match = href.match(/page=(\d+)/);
            return match ? parseInt(match[1], 10) : 1;
        });

        return lastPageNumber;
    } catch (error) {
        console.warn('Last page element not found. Defaulting to page 1.');
        return 1;
    }
};

/**
 * Switches the language to English and extracts the category path.
 * @param {Object} page - The Puppeteer page object.
 * @returns {string} - The category path in English.
 */
const switchToEnglishAndExtractCategoryPath = async (page) => {
    try {
        // Wait for the language switcher to be visible
        await page.waitForSelector('.link-to-language .view-en a', { timeout: 5000 });
        console.log("Language switcher found, preparing to click...");

        // Introduce a delay before clicking the language link
        await delay(2000); // Delay for 2 seconds
        console.log("Clicking the 'English' language option...");

        // Click the language switch link to change the language to English
        await page.click('.link-to-language .view-en a');

        // Wait for navigation after clicking the link
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log("Language switched to English");

        // Extract the English category path
        return await extractCategoryPath(page);
    } catch (error) {
        console.warn('English language switcher not found. Skipping English category extraction.');
        return '';
    }
};

/**
 * Scrapes product names, URLs, and categories from a given URL and appends to a central JSON file.
 * @param {string} baseUrl - The base URL of the first page to scrape.
 * @param {string} outputFile - The name of the output JSON file.
 * @param {number} [start] - The page number to start from (optional).
 * @param {number} [end] - The number of pages to scrape (optional).
 */
const scrapeProducts = async (baseUrl, outputFile, start, end) => {
    // Launch the browser with the specified window size
    const browser = await puppeteer.launch({
        headless: true, // Set headless: true for production
        ignoreHTTPSErrors: true,
        args: [`--window-size=${Math.floor(1920 * 0.7)},${Math.floor(1080 * 0.7)}`],
        defaultViewport: null, // Ensure the tab takes the full window size
    });
    const page = await browser.newPage();

    // Read or initialize the central JSON file
    const products = readOrInitializeJsonFile(outputFile);

    // Navigate to the base URL to extract Arabic categories
    console.log(`Navigating to the base URL to extract categories: ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await delay(1000); // Delay for 1 second after loading the page

    // Extract the Arabic category path
    const categoryPathAr = await extractCategoryPath(page);

    // Switch to English and extract the English category path
    const categoryPathEn = await switchToEnglishAndExtractCategoryPath(page);

    // Append "?sortBy=prod_ar_products_price_default_asc" to the base URL
    const baseUrlWithSort = `${baseUrl}?sortBy=prod_ar_products_price_default_asc`;

    // Determine the start and end pages if not provided
    if (start === undefined || end === undefined) {
        start = 1; // Default to page 1
        end = await extractLastPageNumber(page); // Extract the last page number
        console.log(`Automatically determined start page: ${start}, end page: ${end}`);
    }

    // Loop through pages
    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        const url = `${baseUrlWithSort}&page=${pageNumber}`;
        console.log(`Scraping page ${pageNumber}: ${url}`);

        // Navigate to the page with a delay
        await page.goto(url, { waitUntil: 'networkidle2' });
        await delay(1000); // Delay for 1 second after loading the page

        // Wait for the product list to load
        await page.waitForSelector('li.ais-Hits-item');
        await delay(1000); // Delay for 1 second after the product list loads

        // Extract product data
        const pageProducts = await page.evaluate(() => {
            const productElements = document.querySelectorAll('li.ais-Hits-item');
            const products = [];

            productElements.forEach((product) => {
                // Check if the product has the label <span class="label-Hubstore"></span>
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

        // Process each product
        pageProducts.forEach(newProduct => {
            // Check if the product already exists in the central JSON file
            const existingProductIndex = products.findIndex(p => p.url === newProduct.url);

            if (existingProductIndex === -1) {
                // Product doesn't exist, add it with the new categories
                products.push({
                    ...newProduct,
                    categoryAr: [categoryPathAr], // Store categories as an array
                    categoryEn: [categoryPathEn], // Store categories as an array
                });
            } else {
                // Product exists, add the new categories if they don't already exist
                const existingProduct = products[existingProductIndex];
                
                if (!existingProduct.categoryAr.includes(categoryPathAr)) {
                    existingProduct.categoryAr.push(categoryPathAr);
                }
                
                if (!existingProduct.categoryEn.includes(categoryPathEn)) {
                    existingProduct.categoryEn.push(categoryPathEn);
                }

                // Update the product with the combined categories
                products[existingProductIndex] = existingProduct;
            }
        });

        // Delay before moving to the next page
        await delay(2000); // Delay for 2 seconds before navigating to the next page
    }

    // Close the browser
    await browser.close();

    // Save the updated data back to the JSON file
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    console.log(`Scraped data saved to ${outputFile}`);
};

module.exports = { scrapeProducts };
