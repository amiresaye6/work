const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadImage } = require('./downloadImage');
const { uploadFile, createFolder, createSharedLink } = require('./dropbox');

const INPUT_JSON = path.join(__dirname, 'products.json');
const OUTPUT_JSON = path.join(__dirname, 'products_with_dropbox_links.json');
const FAILED_JSON = path.join(__dirname, 'failed_products.json');
const TEMP_DIR = path.join(os.tmpdir(), 'images_for_dropbox');

// Ensure temp dir exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Load progress if exists
function loadProgress() {
    if (fs.existsSync(OUTPUT_JSON)) {
        console.log('[LOG] Resuming from existing output file...');
        return JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'));
    }
    return null;
}

// Save progress
function saveProgress(products) {
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2), 'utf8');
    console.log('[LOG] Progress saved to output file.');
}

// Save failed products
function saveFailedProduct(product) {
    let failedProducts = [];
    if (fs.existsSync(FAILED_JSON)) {
        try {
            failedProducts = JSON.parse(fs.readFileSync(FAILED_JSON, 'utf8'));
        } catch {
            failedProducts = [];
        }
    }
    failedProducts.push(product);
    fs.writeFileSync(FAILED_JSON, JSON.stringify(failedProducts, null, 2), 'utf8');
    console.log(`[LOG] Added product ${product.productId} to failed_products file.`);
}

async function processProductImages() {
    const originalProducts = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));
    let products;

    // Try to resume from previous progress
    const resumeProducts = loadProgress();
    if (resumeProducts) {
        products = resumeProducts;
    } else {
        products = originalProducts;
    }

    for (let p = 0; p < products.length; p++) {
        let product = products[p];
        let failed = false;

        // If images are already dropbox links, skip
        if (
            product.images &&
            product.images.length > 0 &&
            product.images.every(img => img.startsWith('https://www.dropbox.com/'))
        ) {
            console.log(`[LOG] Product ${product.productId} already processed. Skipping.`);
            continue;
        }

        if (!product.images || !Array.isArray(product.images) || product.images.length === 0) continue;

        const dropboxFolder = `/products/${product.productId}`;
        console.log(`[LOG] Creating folder in Dropbox: ${dropboxFolder}`);

        try {
            await createFolder(dropboxFolder);
        } catch (err) {
            console.error(`[ERROR] Failed to create folder for product ${product.productId}:`, err);
            failed = true;
        }

        const newImageLinks = [];

        for (let i = 0; i < product.images.length && !failed; i++) {
            const imageUrl = product.images[i];
            try {
                let ext = path.extname(imageUrl.split('?')[0]);
                if (!ext || ext.length > 5) ext = '.jpg';
                const tempImagePath = path.join(TEMP_DIR, `${product.productId}_${i}${ext}`);

                console.log(`[LOG] Downloading image #${i + 1} for product ${product.productId}...`);
                await downloadImage(imageUrl, tempImagePath);

                const dropboxImagePath = `${dropboxFolder}/image${i + 1}${ext}`;
                console.log(`[LOG] Uploading to Dropbox: ${dropboxImagePath}`);
                await uploadFile(tempImagePath, dropboxImagePath);

                console.log(`[LOG] Creating Dropbox shared link for: ${dropboxImagePath}`);
                let shareLink = await createSharedLink(dropboxImagePath);
                shareLink = shareLink.replace('?dl=0', '?raw=1');
                newImageLinks.push(shareLink);

                fs.unlinkSync(tempImagePath);
                console.log(`[LOG] Image #${i + 1} processed and temp file deleted.`);
            } catch (err) {
                console.error(`[ERROR] Processing image #${i + 1} for product ${product.productId}:`, err);
                failed = true;
            }
            // Save progress after each image
            product.images = newImageLinks.concat(product.images.slice(newImageLinks.length));
            saveProgress(products);
        }

        if (failed) {
            saveFailedProduct(product);
            // Optionally, you can skip updating images for failed product in the main list
            // product.images = [];
            continue; // skip final save for failed product
        }

        // Save after all images for this product
        product.images = newImageLinks;
        saveProgress(products);
        console.log(`[LOG] Finished processing product ${product.productId}`);
    }

    // Final write
    saveProgress(products);
    console.log(`[LOG] All done. Updated products written to ${OUTPUT_JSON}`);
}

processProductImages().catch(err => {
    console.error('[ERROR] Processing failed:', err);
});