const fs = require('fs');
const puppeteer = require('puppeteer');

// File paths
const inputFilePath = 'allProducts.json';
const outputFilePath = 'all_products_with_images_puppeteer.json';
const progressFilePath = 'progress_puppeteer.txt';
const errorLogPath = 'error_log_puppeteer.txt';

// Configuration
const CONFIG = {
    maxRetries: 3,
    minDelay: 1000,
    maxDelay: 5000,
    timeout: 30000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    concurrent: 3  // Number of concurrent browser pages
};

// Helper function to delay execution
const delay = async (min = CONFIG.minDelay, max = CONFIG.maxDelay) => {
    const delayTime = Math.floor(Math.random() * (max - min)) + min;
    await new Promise(resolve => setTimeout(resolve, delayTime));
};

// Helper function to log errors
const logError = (message, error) => {
    const errorMessage = `[${new Date().toISOString()}] ${message}: ${error.message}\n`;
    fs.appendFileSync(errorLogPath, errorMessage);
    console.error(errorMessage);
};

// Function to fetch image URLs from a product page
async function fetchImageUrls(page, productUrl, retryCount = 0) {
    try {
        await page.goto(productUrl, {
            waitUntil: 'networkidle0',
            timeout: CONFIG.timeout
        });

        // Wait for images to be present
        await page.waitForSelector('img', { timeout: CONFIG.timeout });

        // Scroll through the page to trigger lazy loading
        await autoScroll(page);

        // Get all image URLs, including those in srcset
        const imageUrls = await page.evaluate(() => {
            const uniqueUrls = new Set();
            
            // Process regular src attributes
            document.querySelectorAll('img').forEach(img => {
                if (img.src) uniqueUrls.add(img.src);
                
                // Process srcset if available
                if (img.srcset) {
                    const srcsetUrls = img.srcset.split(',')
                        .map(src => src.trim().split(' ')[0])
                        .filter(url => url.startsWith('http'));
                    srcsetUrls.forEach(url => uniqueUrls.add(url));
                }
            });

            return Array.from(uniqueUrls)
                .filter(url => url.match(/\.(jpg|jpeg|png|webp)/i));
        });

        return imageUrls;

    } catch (error) {
        if (retryCount < CONFIG.maxRetries) {
            console.log(`Retrying ${productUrl} (Attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
            await delay(2000, 5000); // Longer delay for retries
            return fetchImageUrls(page, productUrl, retryCount + 1);
        }
        
        logError(`Failed to fetch images from ${productUrl}`, error);
        return [];
    }
}

// Helper function to auto-scroll the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// Function to process products in batches
async function processProducts() {
    // Read and parse input files
    const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));
    let lastProcessedIndex = 0;

    if (fs.existsSync(progressFilePath)) {
        lastProcessedIndex = parseInt(fs.readFileSync(progressFilePath, 'utf-8'), 10) || 0;
    }

    // Launch browser
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Create a pool of pages
        const pages = await Promise.all(
            Array(CONFIG.concurrent).fill(null).map(async () => {
                const page = await browser.newPage();
                await page.setViewport({
                    width: CONFIG.viewportWidth,
                    height: CONFIG.viewportHeight
                });
                return page;
            })
        );

        // Process products in batches
        for (let i = lastProcessedIndex; i < products.length; i += CONFIG.concurrent) {
            const batch = products.slice(i, i + CONFIG.concurrent);
            const promises = batch.map(async (product, index) => {
                const page = pages[index];
                console.log(`Processing product ${i + index + 1}/${products.length}: ${product.name}`);
                
                product.galleryImages = await fetchImageUrls(page, product.url);
                return product;
            });

            await Promise.all(promises);

            // Update progress and save results
            fs.writeFileSync(progressFilePath, (i + batch.length).toString());
            fs.writeFileSync(outputFilePath, JSON.stringify(products, null, 2));

            // Delay between batches
            await delay();
        }

        console.log('Processing complete!');

    } catch (error) {
        logError('Fatal error during processing', error);
        throw error;

    } finally {
        // Clean up: close all pages and the browser
        await browser.close();
    }
}

// Start processing with error handling
processProducts()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });