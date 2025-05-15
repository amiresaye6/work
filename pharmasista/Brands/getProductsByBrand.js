const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Get current date and time in UTC
function getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

// Log with timestamp
function logWithTime(message) {
    const timestamp = getCurrentDateTime();
    console.log(`[${timestamp}] ${message}`);
}

async function loadBrands(jsonFile = 'fuzzyArMatchingBrands.json') {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logWithTime(`Error loading ${jsonFile}: ${error.message}`);
        return { matchingBrands: [] };
    }
}

async function saveProgress(progress, file = 'arBrand_progress.json') {
    try {
        progress.timestamp = getCurrentDateTime();
        progress.user = 'amiresaye6';
        await fs.writeFile(file, JSON.stringify(progress, null, 2), 'utf8');
        logWithTime(`Progress saved: Brand ${progress.brand}, Page ${progress.page}`);
    } catch (error) {
        logWithTime(`Error saving progress: ${error.message}`);
    }
}

async function loadProgress(file = 'arBrand_progress.json') {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { brand: '', page: 1, brandIndex: 0, timestamp: getCurrentDateTime(), user: 'amiresaye6' };
    }
}

async function saveProducts(products, filePath) {
    try {
        await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        logWithTime(`Error saving products to ${filePath}: ${error.message}`);
    }
}

async function loadProducts(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function openUrl(url, outputFile, brandName, brandData, startPage = 1) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Read cookies from cookies.json
        const cookiesString = await fs.readFile('./cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        logWithTime('Cookies loaded and set successfully');
    } catch (error) {
        logWithTime(`Error loading or setting cookies: ${error.message}`);
    }

    // Navigate to the first page
    logWithTime(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    logWithTime(`Navigated to the initial URL for brand: ${brandName}`);

    // Get total number of products
    const totalProducts = await page.evaluate(() => {
        const statsElement = document.querySelector('.ais-Stats-text');
        if (statsElement) {
            const text = statsElement.textContent.match(/\d+/);
            return text ? parseInt(text[0]) : 0;
        }
        return 0;
    });

    const productsPerPage = 20;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    logWithTime(`Total products for ${brandName}: ${totalProducts}, Total pages: ${totalPages}`);

    // Load existing products
    let allProducts = await loadProducts(outputFile);

    // Loop through pages starting from startPage
    for (let currentPage = startPage; currentPage <= totalPages; currentPage++) {
        logWithTime(`Processing ${brandName} - page ${currentPage} of ${totalPages}`);

        // Navigate to the specific page if not the first page
        if (currentPage > 1) {
            // Check if the URL already has a page parameter
            const pageUrl = url.includes('page=')
                ? url.replace(/page=\d+/, `page=${currentPage}`)
                : url + (url.includes('?') ? '&' : '?') + `page=${currentPage}`;

            logWithTime(`Navigating to URL: ${pageUrl}`);
            await page.goto(pageUrl, { waitUntil: 'networkidle2' });
            logWithTime(`Navigated to ${brandName} - page ${currentPage}`);
        }

        // Gather products from current page
        const pageProducts = await gatherProductInfo(page);

        // Add brand data to each product
        pageProducts.forEach(product => {
            product.brand = brandName;
            product.brandData = brandData;
            product.scrapedAt = getCurrentDateTime();
            product.scrapedBy = 'amiresaye6';
        });

        allProducts = allProducts.concat(pageProducts);

        // Save products incrementally
        await saveProducts(allProducts, outputFile);

        // Save progress
        await saveProgress({
            brand: brandName,
            page: currentPage,
            brandIndex: -1 // Will be updated in the main function
        });
    }

    await browser.close();
    logWithTime(`Browser closed - Completed scraping for ${brandName}`);

    return allProducts.length;
}

async function gatherProductInfo(page) {
    try {
        await page.waitForSelector('.js-plp-product', { timeout: 10000 });

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

                // Extract original price
                const originalPriceElement = product.querySelector('span.text-gray.line-through');
                productInfo.originalPrice = originalPriceElement && originalPriceElement.textContent.trim() !== ''
                    ? originalPriceElement.textContent.trim()
                    : '';

                // Extract discount
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

        logWithTime(`Collected ${products.length} products from current page`);
        return products;

    } catch (error) {
        logWithTime(`Error gathering product information: ${error.message}`);
        return [];
    }
}

async function main() {
    logWithTime(`Starting brand scraper - User: amiresaye6`);

    // Create brands folder if it doesn't exist
    const brandsFolder = 'brandsAr';
    await fs.mkdir(brandsFolder, { recursive: true });

    // Load brands data
    const brandsData = await loadBrands();
    if (!brandsData.matchingBrands || brandsData.matchingBrands.length === 0) {
        logWithTime('No brands loaded. Exiting.');
        return;
    }

    // Load progress
    const progress = await loadProgress();
    const lastBrand = progress.brand || '';
    let lastPage = progress.page || 1;
    let brandIndex = progress.brandIndex || 0;

    // If brandIndex is -1 (was being processed but not yet incremented), 
    // find the correct index of the last processed brand
    if (brandIndex === -1 && lastBrand) {
        brandIndex = brandsData.matchingBrands.findIndex(
            item => item.firstFile.brand === lastBrand
        );
        if (brandIndex !== -1) {
            // We found the brand, so start with the next one
            brandIndex++;
        } else {
            // Brand not found, start from the beginning
            brandIndex = 0;
            lastPage = 1;
        }
    }

    logWithTime(`Starting from brand index ${brandIndex}${lastBrand ? ` (${lastBrand})` : ''}, page ${lastPage}`);

    // Process each brand starting from the saved progress
    for (let i = brandIndex; i < brandsData.matchingBrands.length; i++) {
        const brandData = brandsData.matchingBrands[i];
        const brandName = brandData.firstFile.brand;

        // Skip brands we've already completed
        if (i < brandIndex) continue;

        // Determine which page to start from
        const currentPage = (i === brandIndex && lastBrand === brandName) ? lastPage : 1;

        logWithTime(`Processing brand ${i + 1}/${brandsData.matchingBrands.length}: ${brandName}`);

        // Create URL for this brand - properly encode the brand name
        const encodedBrand = encodeURIComponent(brandName);
        const url = `https://www.nahdionline.com/ar-sa/search?refinementList%5Bmanufacturer%5D%5B0%5D=${encodedBrand}`;
        logWithTime(`Generated URL for ${brandName}: ${url}`);

        // Output file for this brand
        const safeFileName = brandName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
        const outputFile = path.join(brandsFolder, `${safeFileName}.json`);

        try {
            // Save current brand index before starting
            await saveProgress({
                brand: brandName,
                page: currentPage,
                brandIndex: i
            });

            // Scrape products for this brand
            const productCount = await openUrl(url, outputFile, brandName, brandData, currentPage);

            logWithTime(`Successfully saved ${productCount} products for ${brandName} to ${outputFile}`);
        } catch (error) {
            logWithTime(`Error scraping brand ${brandName}: ${error.message}`);
            // Progress has already been saved within openUrl function
            continue;
        }
    }

    // Reset progress when all brands have been processed
    await saveProgress({ brand: '', page: 1, brandIndex: 0 });
    logWithTime('Scraping of all brands completed.');
}

main().catch(async (error) => {
    logWithTime(`Script terminated due to error: ${error.message}`);
    process.exit(1);
});

process.on('SIGINT', async () => {
    logWithTime('Script stopped by user. Progress saved.');
    process.exit(0);
});