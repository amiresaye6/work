const fs = require('fs'); // Use regular fs instead of fs.promises
const fsp = require('fs').promises; // Use this for promise-based operations
const path = require('path');
const axios = require('axios');

// Function to download an image
async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filepath); // Use regular fs here
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${url}: ${error.message}`);
    }
}

// Helper function to generate a random delay between 1 to 5 seconds
function getRandomDelay() {
    return Math.floor(Math.random() * 5000) + 1000;
}

// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process products
async function processProducts(jsonFilePath) {
    try {
        // Read and parse the JSON file using fs.promises
        const data = await fsp.readFile(jsonFilePath, 'utf8');
        const products = JSON.parse(data);

        // Ensure products is an array
        const productsArray = Array.isArray(products) ? products : [products];

        // Create base products directory if it doesn't exist
        const baseDir = 'products';
        await fsp.mkdir(baseDir, { recursive: true });

        // Process each product
        for (const product of productsArray) {
            // Extract folder name from URL
            const urlParts = product.url.split('/');
            const folderName = product.custom_url ? product.custom_url.replace(/[^a-z0-9-]/gi, '_') : urlParts[urlParts.length - 1];
            const productDir = path.join(baseDir, folderName);

            // Create product directory
            await fsp.mkdir(productDir, { recursive: true });

            // Filter out unwanted images and download the rest
            let validImages = product.galleryImages.filter(
                img => img !== 'https://cdn.salla.network/images/s-empty.png?v=2.0.5' && img !== 'https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/ZqwGb/39mQ3syvc7acQqmg3b2HEGAhjYvSnurRDPtzBosH.png'
            );


            validImages = new Set(validImages);
            validImages = Array.from(validImages);

            // Download each valid image
            for (let i = 0; i < validImages.length; i++) {
                const imageUrl = validImages[i];
                const extension = path.extname(imageUrl.split('?')[0]);
                const imagePath = path.join(productDir, `image_${i + 1}${extension}`);
                
                console.log(`Downloading ${imageUrl} to ${imagePath}`);
                await downloadImage(imageUrl, imagePath);
            }

            console.log(`Finished processing ${folderName} - ${validImages.length} images downloaded`);

            // Add a random delay between processing each product
            const delayTime = getRandomDelay();
            console.log(`Waiting for ${delayTime / 1000} seconds before processing the next product...`);
            await delay(delayTime);
        }

        console.log('All products processed successfully');
    } catch (error) {
        console.error('Error processing products:', error);
    }
}

// Usage: Replace 'products.json' with your JSON file path
processProducts('unDownloadedYet.json');