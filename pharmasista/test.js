const puppeteer = require('puppeteer');
const fs = require('fs').promises; // For reading and writing files

async function openUrl(url) {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'] // This maximizes the browser window
    });
    
    const page = await browser.newPage();

    try {
        // Read cookies from cookies.json
        const cookiesString = await fs.readFile('./cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesString);

        // Set cookies on the page
        await page.setCookie(...cookies);
        console.log('Cookies loaded and set successfully');
    } catch (error) {
        console.error('Error loading or setting cookies:', error.message);
    }

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Navigated to the URL');

    // Call the function to gather product information
    await gatherProductInfo(page);

    // Close the browser
    await browser.close();
    console.log('Browser closed');
}

async function gatherProductInfo(page) {
    try {
        // Wait for the product components to load
        await page.waitForSelector('.js-plp-product');

        // Extract product information
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.js-plp-product');
            const productData = [];

            productElements.forEach((product) => {
                const productInfo = {};

                // Extract product title
                const titleElement = product.querySelector('span.line-clamp-3');
                productInfo.title = titleElement ? titleElement.textContent.trim() : '';

                // Extract product URL and product ID
                const linkElement = product.querySelector('a[href*="/pdp/"]');
                productInfo.url = linkElement ? linkElement.href : '';
                productInfo.productId = linkElement && linkElement.href.match(/\/pdp\/(\d+)/) ? linkElement.href.match(/\/pdp\/(\d+)/)[1] : '';

                // Extract image URL
                const imgElement = product.querySelector('img');
                productInfo.imageUrl = imgElement ? imgElement.src : '';

                // Extract current price (discounted or non-discounted)
                const discountedPriceElement = product.querySelector('span.text-red');
                const nonDiscountedPriceElement = product.querySelector('span.text-gray-dark');
                productInfo.price = discountedPriceElement 
                    ? discountedPriceElement.textContent.trim()
                    : (nonDiscountedPriceElement ? nonDiscountedPriceElement.textContent.trim() : null);

                // Extract original price (only if crossed out and non-empty)
                const originalPriceElement = product.querySelector('span.text-gray.line-through');
                productInfo.originalPrice = originalPriceElement && originalPriceElement.textContent.trim() !== '' 
                    ? originalPriceElement.textContent.trim() 
                    : '';

                // Extract discount (if present)
                const discountElement = product.querySelector('div.bg-red span.text-white');
                productInfo.discount = discountElement ? discountElement.textContent.trim() : '';

                // Check for express status
                const expressElement = product.querySelector('div[style*="background-color"] svg[aria-label="express"]');
                productInfo.isExpress = !!expressElement;

                // Extract data-position attribute
                productInfo.position = product.getAttribute('data-position') || '';

                productData.push(productInfo);
            });

            return productData;
        });

        // Save to JSON file
        await fs.writeFile('products.json', JSON.stringify(products, null, 2));
        console.log(`Saved ${products.length} products to products.json`);

    } catch (error) {
        console.error('Error gathering product information:', error.message);
    }
}

const url = 'https://www.nahdionline.com/ar-sa/plp/daily-shampoo-offers?page=10';
openUrl(url).catch(console.error);