const fs = require('fs').promises;
const path = require('path');

// Get current date and time in UTC in YYYY-MM-DD HH:MM:SS format
function getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

// Configuration
const currentDateTime = "2025-05-13 15:20:09"; // From your input
const currentUser = "amiresaye6"; // From your input
const brandsFolder = './brandsAr';
const outputFile = './Arall_brands_combined.json';

async function combineFiles() {
    try {
        console.log(`[${currentDateTime}] Starting to combine brand files - User: ${currentUser}`);

        // Get list of all files in brands folder
        const files = await fs.readdir(brandsFolder);
        console.log(`[${currentDateTime}] Found ${files.length} brand files to combine.`);

        // Filter to only include .json files
        const jsonFiles = files.filter(file => file.toLowerCase().endsWith('.json'));
        console.log(`[${currentDateTime}] Filtering to ${jsonFiles.length} JSON files.`);

        // Array to hold all products from all files
        let allProducts = [];
        let brandStats = [];

        // Track processing stats
        let totalFilesProcessed = 0;
        let totalProductsAdded = 0;

        // Process each file
        for (const file of jsonFiles) {
            const filePath = path.join(brandsFolder, file);
            const brandName = file.replace('.json', '').replace(/_/g, ' ');

            try {
                // Read and parse file
                const data = await fs.readFile(filePath, 'utf8');
                const products = JSON.parse(data);

                if (Array.isArray(products) && products.length > 0) {
                    console.log(`[${currentDateTime}] Processing ${file} - ${products.length} products found`);

                    // Add all products from this file to the combined array
                    allProducts = allProducts.concat(products);
                    totalProductsAdded += products.length;

                    // Add stats for this brand
                    brandStats.push({
                        brandFileName: file,
                        brandName: brandName,
                        productCount: products.length,
                        brandData: products[0]?.brandData || null
                    });
                } else {
                    console.log(`[${currentDateTime}] Warning: ${file} doesn't contain an array of products or is empty`);
                }

                totalFilesProcessed++;
            } catch (error) {
                console.error(`[${currentDateTime}] Error processing ${file}: ${error.message}`);
            }
        }

        // Sort brandStats by product count in descending order
        brandStats.sort((a, b) => b.productCount - a.productCount);

        // Create the final output object
        const outputData = {
            meta: {
                generatedAt: currentDateTime,
                generatedBy: currentUser,
                totalBrands: brandStats.length,
                totalProducts: allProducts.length,
                brandStats: brandStats
            },
            products: allProducts
        };

        // Write the combined data to the output file
        await fs.writeFile(outputFile, JSON.stringify(outputData, null, 2), 'utf8');

        console.log(`[${currentDateTime}] Combination complete!`);
        console.log(`[${currentDateTime}] Successfully processed ${totalFilesProcessed} brand files`);
        console.log(`[${currentDateTime}] Added ${totalProductsAdded} products`);
        console.log(`[${currentDateTime}] Output saved to ${outputFile}`);

    } catch (error) {
        console.error(`[${currentDateTime}] Error combining files: ${error.message}`);
    }
}

// Run the function
combineFiles().catch(error => {
    console.error(`[${currentDateTime}] Fatal error: ${error.message}`);
    process.exit(1);
});