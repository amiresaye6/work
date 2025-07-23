/**
 * Single URL Product Scraper (with Resume and Page Tracking)
 * 
 * This version also saves any failed page URLs in pages.json for later retry or investigation!
 * 
 * FIX: If it's the first page, do not add "?page=1" to the URL -- use the base URL as-is.
 * For other pages, append "?page=N" (or "&page=N" if the base URL already contains "?").
 * All other features are the same. Comments are for future reference!
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// -------- CONFIG ---------

const BASE_URL = 'https://www.nahdionline.com/en-sa/healthy-nutrition/plp/72118'; // <-- BASE URL, no page param
const END_PAGE = 36; // <-- UPDATE THIS!
const OUTPUT_FILE = 'healthy-nutrition_products.json';
const PROGRESS_FILE = 'progress.json';
const FAILED_PAGES_FILE = 'FailedPages.json';
const SCRAPER_USER = 'amiresaye6';

// -------- UTILS ---------

function getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

function logWithTime(message) {
    const timestamp = getCurrentDateTime();
    console.log(`[${timestamp}] ${message}`);
}

async function saveProgress(progress, file = PROGRESS_FILE) {
    try {
        progress.timestamp = getCurrentDateTime();
        progress.user = SCRAPER_USER;
        await fs.writeFile(file, JSON.stringify(progress, null, 2), 'utf8');
        logWithTime(`Progress saved: Page ${progress.page}`);
    } catch (error) {
        logWithTime(`Error saving progress: ${error.message}`);
    }
}

async function loadProgress(file = PROGRESS_FILE) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { page: 1, timestamp: getCurrentDateTime(), user: SCRAPER_USER };
    }
}

async function saveProducts(products, filePath) {
    try {
        await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf8');
        logWithTime(`Saved products. Total so far: ${products.length}`);
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

// Save failed page URL to pages.json
async function saveFailedPage(pageUrl, file = FAILED_PAGES_FILE) {
    try {
        let failedPages = [];
        try {
            const data = await fs.readFile(file, 'utf8');
            failedPages = JSON.parse(data);
        } catch (error) {
            // file does not exist or is invalid, start with empty array
        }
        failedPages.push({
            url: pageUrl,
            timestamp: getCurrentDateTime(),
            user: SCRAPER_USER
        });
        await fs.writeFile(file, JSON.stringify(failedPages, null, 2), 'utf8');
        logWithTime(`Saved failed page: ${pageUrl}`);
    } catch (error) {
        logWithTime(`Error saving failed page: ${error.message}`);
    }
}

// -------- SCRAPING ---------

async function gatherProductInfo(page) {
    try {
        await page.waitForSelector('.js-plp-product', { timeout: 120000 });
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.js-plp-product');
            const productData = [];
            productElements.forEach((product) => {
                const productInfo = {};
                const titleElement = product.querySelector('span.line-clamp-3');
                productInfo.title = titleElement ? titleElement.textContent.trim() : '';
                const linkElement = product.querySelector('a[href*="/pdp/"]');
                productInfo.url = linkElement ? linkElement.href : '';
                productInfo.productId = linkElement && linkElement.href.match(/\/pdp\/(\d+)/) ? linkElement.href.match(/\/pdp\/(\d+)/)[1] : '';
                const imgElement = product.querySelector('img');
                productInfo.imageUrl = imgElement ? imgElement.src : '';
                const discountedPriceElement = product.querySelector('span.text-red');
                const nonDiscountedPriceElement = product.querySelector('span.text-gray-dark');
                productInfo.price = discountedPriceElement
                    ? discountedPriceElement.textContent.trim()
                    : (nonDiscountedPriceElement ? nonDiscountedPriceElement.textContent.trim() : null);
                const originalPriceElement = product.querySelector('span.text-gray.line-through');
                productInfo.originalPrice = originalPriceElement && originalPriceElement.textContent.trim() !== ''
                    ? originalPriceElement.textContent.trim()
                    : '';
                const discountElement = product.querySelector('div.bg-red span.text-white');
                productInfo.discount = discountElement ? discountElement.textContent.trim() : '';
                const expressElement = product.querySelector('div[style*="background-color"] svg[aria-label="express"]');
                productInfo.isExpress = !!expressElement;
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

function getPageUrl(baseUrl, pageNum) {
    // If pageNum === 1, return baseUrl as-is
    if (pageNum === 1) return baseUrl;
    // If baseUrl already contains '?', add &page=NUM
    if (baseUrl.includes('?')) return baseUrl + '&page=' + pageNum;
    // Otherwise, add ?page=NUM
    return baseUrl + '?page=' + pageNum;
}

async function openSingleUrl(baseUrl, outputFile, startPage = 1, endPage = END_PAGE) {
    logWithTime(`Launching browser...`);
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Load cookies if needed (optional, remove if not required)
    try {
        const cookiesString = await fs.readFile('./cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        logWithTime('Cookies loaded and set successfully');
    } catch (error) {
        logWithTime('No cookies loaded (that may be fine)');
    }

    let allProducts = await loadProducts(outputFile);

    for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
        // Get correct page URL
        const pageUrl = getPageUrl(baseUrl, currentPage);
        logWithTime(`Navigating to page ${currentPage}: ${pageUrl}`);

        let pageProducts = [];
        try {
            console.log(`Navigating to page ${currentPage}...`);
            
            await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 120000 });
            pageProducts = await gatherProductInfo(page);
        } catch (error) {
            logWithTime(`Failed to fetch page ${currentPage}: ${error.message}`);
            await saveFailedPage(pageUrl); // Save failed page to FailedPages.json
            // Save progress before continue
            await saveProgress({
                page: currentPage
            });
            continue; // Skip to next page
        }

        pageProducts.forEach(product => {
            product.scrapedAt = getCurrentDateTime();
            product.scrapedBy = SCRAPER_USER;
            product.page = currentPage;
        });

        allProducts = allProducts.concat(pageProducts);

        await saveProducts(allProducts, outputFile);
        await saveProgress({
            page: currentPage
        });
    }

    await browser.close();
    logWithTime(`Finished scraping up to page ${endPage}. Saved ${allProducts.length} products to ${outputFile}.`);
}

// -------- MAIN ---------

async function main() {
    logWithTime(`Starting single URL scraper - User: ${SCRAPER_USER}`);
    const progress = await loadProgress();
    let startPage = progress.page || 1;
    logWithTime(`Starting from page ${startPage}`);
    await openSingleUrl(BASE_URL, OUTPUT_FILE, startPage, END_PAGE);
    await saveProgress({ page: 1 });
    logWithTime('Scraping completed.');
}

main().catch(async (error) => {
    logWithTime(`Script terminated due to error: ${error.message}`);
    process.exit(1);
});

process.on('SIGINT', async () => {
    logWithTime('Script stopped by user. Progress saved.');
    process.exit(0);
});