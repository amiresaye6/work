const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Input file path with product data
const inputFilePath = 'filteredProducts.json'; // Adjust if your file is named differently

// Base directory for products
const baseDir = 'products';

// Load product data
const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

// Function to download an image
async function downloadImage(url, filePath) {
    try {
        if (!url || url === "") return; // Skip empty URLs
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream', // Handle binary data
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}:`, error.message);
    }
}

// Function to introduce a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process products and download their specific images
async function processProducts() {
    // Create base 'products' directory if it doesn’t exist
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    for (const product of products) {
        const productId = product.productId;
        const productDir = path.join(baseDir, productId); // Folder named after productId, e.g., products/39593491595379

        // Create a folder for this specific product if it doesn’t exist
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir);
        }

        console.log(`Processing product ${productId}...`);

        // Download only the images for this product
        const imagePromises = product.images.map(async (imageUrl, index) => {
            if (!imageUrl || imageUrl === "") return; // Skip empty URLs
            // Use index + original filename to ensure unique names within this product’s folder
            const fileName = `${index + 1}_${path.basename(imageUrl.split('?')[0])}`;
            const filePath = path.join(productDir, fileName);
            await downloadImage(imageUrl, filePath);
            console.log(`Downloaded ${fileName} for ${productId}`);
        });

        // Wait for all images for this product to finish downloading before moving to the next product
        await Promise.all(imagePromises);

        // Add a delay between processing each product
        await delay(1000); // 1 second delay
    }

    console.log('All products processed and images downloaded!');
}

// Run the script
processProducts().catch(error => {
    console.error('Error processing products:', error);
});