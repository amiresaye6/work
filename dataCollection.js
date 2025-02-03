const puppeteer = require('puppeteer');
const fs = require('fs');

// Helper function to introduce delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scrapes product names and URLs from a given URL and saves them to a JSON file.
 * @param {number} start - The page number to start from.
 * @param {number} end - The number of pages to scrape.
 * @param {string} baseUrl - The base URL of the first page to scrape.
 * @param {string} outputFile - The name of the output JSON file.
 */
const scrapeProducts = async (start, end, baseUrl, outputFile) => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless: true for production
    const page = await browser.newPage();

    // Array to store all scraped products
    const products = [];

    // Loop through pages
    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        const url = `${baseUrl}&page=${pageNumber}`;
        console.log(`Scraping page ${pageNumber}: ${url}`);

        // Navigate to the page with a delay
        await page.goto(url, { waitUntil: 'networkidle2' });
        await delay(1000); // Delay for 3 seconds after loading the page

        // Wait for the product list to load
        await page.waitForSelector('li.ais-Hits-item');
        await delay(1000); // Delay for 2 seconds after the product list loads

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

        // Add the scraped products to the main array
        products.push(...pageProducts);

        // Delay before moving to the next page
        await delay(2000); // Delay for 5 seconds before navigating to the next page
    }

    // Close the browser
    await browser.close();

    // Save the scraped data to a JSON file
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    console.log(`Scraped data saved to ${outputFile}`);
};

// Example usage
(async () => {
    const start = 33; // starting page number
    const end = 35; // ending page number
    const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/mens-health?sortBy=prod_ar_products_price_default_asc';
    const outputFile = 'products.json';

    await scrapeProducts(start, end, baseUrl, outputFile);
})();