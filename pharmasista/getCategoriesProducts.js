const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function loadCategories(jsonFile = 'categoryToDownload.json') {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${jsonFile}: ${error.message}`);
        return [];
    }
}

async function saveProgress(progress, file = 'progress.json') {
    try {
        await fs.writeFile(file, JSON.stringify(progress, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving progress: ${error.message}`);
    }
}

async function loadProgress(file = 'progress.json') {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { main_category: '', sub_category: '', page: 1 };
    }
}

async function saveProducts(products, filePath) {
    try {
        await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving products to ${filePath}: ${error.message}`);
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

async function openUrl(url, outputFile, mainCategory, subCategory, startPage = 1) {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Read cookies from cookies.json
        const cookiesString = await fs.readFile('./cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log('Cookies loaded and set successfully');
    } catch (error) {
        console.error('Error loading or setting cookies:', error.message);
    }

    // Navigate to the first page
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Navigated to the initial URL');

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
    console.log(`Total products: ${totalProducts}, Total pages: ${totalPages}`);

    // Load existing products
    let allProducts = await loadProducts(outputFile);

    // Loop through pages starting from startPage
    for (let currentPage = startPage; currentPage <= totalPages; currentPage++) {
        console.log(`Processing page ${currentPage}`);

        // Navigate to the specific page if not the first page
        if (currentPage > 1) {
            const pageUrl = url.replace(/page=\d+/, `page=${currentPage}`);
            await page.goto(pageUrl, { waitUntil: 'networkidle2' });
            console.log(`Navigated to page ${currentPage}`);
        }

        // Gather products from current page
        const pageProducts = await gatherProductInfo(page, outputFile);
        // Add main and sub category to each product
        pageProducts.forEach(product => {
            product.main_category = mainCategory;
            product.sub_category = subCategory;
        });
        allProducts = allProducts.concat(pageProducts);

        // Save products incrementally
        await saveProducts(allProducts, outputFile);

        // Save progress
        await saveProgress({
            main_category: mainCategory,
            sub_category: subCategory,
            page: currentPage
        });
    }

    // Save all products to the output file
    await saveProducts(allProducts, outputFile);
    console.log(`Saved ${allProducts.length} products to ${outputFile}`);

    await browser.close();
    console.log('Browser closed');
}

async function gatherProductInfo(page, outputFile) {
    try {
        await page.waitForSelector('.js-plp-product');

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

        console.log(`Collected ${products.length} products from current page`);
        return products;

    } catch (error) {
        console.error('Error gathering product information:', error.message);
        return [];
    }
}

async function main() {
    const categories = await loadCategories();
    if (!categories.length) {
        console.error('No categories loaded. Exiting.');
        return;
    }

    const progress = await loadProgress();
    let lastMain = progress.main_category || '';
    let lastSub = progress.sub_category || '';
    let lastPage = progress.page || 1;

    let resume = false;
    for (const category of categories) {
        const mainCategory = category.mainCategory || '';
        if (!mainCategory) continue;

        const mainFolder = mainCategory.replace(/\s/g, '_');
        await fs.mkdir(mainFolder, { recursive: true });

        if (lastMain && mainCategory !== lastMain && !resume) continue;
        if (mainCategory === lastMain) resume = true;

        for (const subCat of category.subCategories || []) {
            const subCategory = subCat.name || '';
            const url = subCat.url || '';
            if (!subCategory || !url) continue;

            if (resume && lastMain === mainCategory && lastSub && subCategory !== lastSub) continue;
            if (lastMain === mainCategory && lastSub === subCategory) {
                resume = true;
            } else {
                lastPage = 1;
            }

            const subFile = subCategory.replace(/\s/g, '_') + '.json';
            const outputFile = path.join(mainFolder, subFile);

            console.log(`Scraping ${mainCategory} - ${subCategory}`);
            try {
                await openUrl(url + '/?page=1', outputFile, mainCategory, subCategory, lastPage);
            } catch (error) {
                console.error(`Error scraping ${subCategory}: ${error.message}`);
                await saveProgress({
                    main_category: mainCategory,
                    sub_category: subCategory,
                    page: lastPage
                });
                continue;
            }

            lastPage = 1;
        }
    }

    await saveProgress({ main_category: '', sub_category: '', page: 1 });
    console.log('Scraping completed.');
}

main().catch(async (error) => {
    console.error(`Script terminated due to error: ${error.message}`);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('Script stopped by user. Progress saved.');
    process.exit(0);
});