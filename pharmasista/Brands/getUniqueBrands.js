const fs = require('fs');

// Function to read and analyze the JSON file
function analyzeBrands(inputFilePath, outputFilePath) {
    try {
        // Read the input JSON file
        const rawData = fs.readFileSync(inputFilePath, 'utf8');
        const products = JSON.parse(rawData);

        // Initialize object to store brand counts
        const brandCounts = {};

        // Loop through each product
        products.forEach(product => {
            // Use the "Brand" field, but fall back to "براند" if "Brand" is empty
            const brand = product.Brand || product["براند"] || "Unknown";

            // If this brand is not yet in our counts, initialize it
            if (!brandCounts[brand]) {
                brandCounts[brand] = 0;
            }

            // Increment the count for this brand
            brandCounts[brand]++;
        });

        // Prepare the output data
        const outputData = {
            totalProducts: products.length,
            uniqueBrands: Object.keys(brandCounts).length,
            brandBreakdown: brandCounts
        };

        // Write the output to a JSON file
        fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));

        console.log(`Analysis complete! Results saved to ${outputFilePath}`);
        console.log(`Total products: ${outputData.totalProducts}`);
        console.log(`Unique brands: ${outputData.uniqueBrands}`);

    } catch (error) {
        console.error('Error processing the file:', error.message);
    }
}

// File paths
const inputFilePath = 'pharmacista_master_data_updated_5_7_2025_2025-05-12_16-56-47.json';
const outputFilePath = 'pharmacista_brand-analysis.json';

// Run the analysis
analyzeBrands(inputFilePath, outputFilePath);