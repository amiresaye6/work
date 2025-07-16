const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadImage } = require('./downloadImage');
const { uploadFile, createFolder, createSharedLink } = require('./dropbox');

const INPUT_JSON = path.join(__dirname, 'products.json');
const OUTPUT_JSON = path.join(__dirname, 'products_with_dropbox_links.json');
const TEMP_DIR = path.join(os.tmpdir(), 'images_for_dropbox');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function processProductImages() {
    const products = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));

    for (let product of products) {
        if (!product.images || !Array.isArray(product.images) || product.images.length === 0) continue;

        const dropboxFolder = `/products/${product.productId}`;
        await createFolder(dropboxFolder); // create folder in Dropbox

        const newImageLinks = [];
        for (let i = 0; i < product.images.length; i++) {
            const imageUrl = product.images[i];
            try {
                // Get extension from URL or default to .jpg
                let ext = path.extname(imageUrl.split('?')[0]);
                if (!ext || ext.length > 5) ext = '.jpg';
                const tempImagePath = path.join(TEMP_DIR, `${product.productId}_${i}${ext}`);

                await downloadImage(imageUrl, tempImagePath);

                const dropboxImagePath = `${dropboxFolder}/image${i + 1}${ext}`;
                await uploadFile(tempImagePath, dropboxImagePath);

                let shareLink = await createSharedLink(dropboxImagePath);
                // Get direct image link
                shareLink = shareLink.replace('?dl=0', '?raw=1');

                newImageLinks.push(shareLink);

                fs.unlinkSync(tempImagePath);
            } catch (err) {
                console.error(`Error processing image #${i + 1} for product ${product.productId}:`, err);
                newImageLinks.push(imageUrl); // fallback to original if failed
            }
        }
        product.images = newImageLinks;
    }

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2), 'utf8');
    console.log(`Done. Updated products written to ${OUTPUT_JSON}`);
}

processProductImages().catch(err => {
    console.error('Processing failed:', err);
});