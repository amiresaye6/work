const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// File paths
const inputFilePath = 'allProducts.json'; // Path to the input JSON file
const outputFilePath = 'all_products_with_images.json'; // Path to the output JSON file
const progressFilePath = 'progress.txt'; // Path to the progress file

// Load the JSON file
const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

// Function to fetch image URLs from a product page
async function fetchImageUrls(productUrl) {
    try {
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);

        const imageUrls = [];
        $('img').each((index, element) => {
            const imageUrl = $(element).attr('src');
            if (imageUrl) {
                imageUrls.push(imageUrl);
            }
        });

        return imageUrls;
    } catch (error) {
        console.error(`Error fetching images from ${productUrl}:`, error.message);
        return [];
    }
}

// Function to process products
async function processProducts() {
    // Read progress (last processed index)
    let lastProcessedIndex = 0;
    if (fs.existsSync(progressFilePath)) {
        lastProcessedIndex = parseInt(fs.readFileSync(progressFilePath, 'utf-8'), 10) || 0;
    }

    // Loop through products starting from the last processed index
    for (let i = lastProcessedIndex; i < products.length; i++) {
        const product = products[i];
        console.log(`Processing product ${i + 1}/${products.length}: ${product.name}`);

        // Fetch image URLs
        const galleryImages = await fetchImageUrls(product.url);
        product.galleryImages = galleryImages;

        // Save progress
        fs.writeFileSync(progressFilePath, i.toString());

        // Save updated JSON (optional: save after each product to minimize data loss)
        fs.writeFileSync(outputFilePath, JSON.stringify(products, null, 2));
    }

    console.log('Processing complete!');
}

// Start processing
processProducts().catch((error) => {
    console.error('Error during processing:', error);
});