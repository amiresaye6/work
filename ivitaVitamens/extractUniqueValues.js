/**
 * Script to extract all unique product objects for a given identifier from a JSON file.
 * 
 * Usage:
 *   node extractUniqueValues.js input.json identifier output.json
 * 
 * Example:
 *   node extractUniqueValues.js products.json brand products_unique.json
 */

const fs = require('fs');

// Get arguments
const [,, inputFile, identifier, outputFile] = process.argv;

if (!inputFile || !identifier || !outputFile) {
    console.error('Usage: node extractUniqueValues.js input.json identifier output.json');
    process.exit(1);
}

try {
    // Read and parse input file
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // Create a map to store unique products by identifier value
    const uniqueProductsMap = {};
    
    // Process each item
    (Array.isArray(data) ? data : Object.values(data)).forEach(item => {
        const identifierValue = item[identifier];
        
        // Skip if identifier value is undefined or null
        if (typeof identifierValue === 'undefined' || identifierValue === null) {
            return;
        }
        
        // Store the full product object for each unique identifier value
        if (!uniqueProductsMap[identifierValue]) {
            uniqueProductsMap[identifierValue] = item;
        }
    });
    
    // Convert map to array of product objects
    const uniqueProducts = Object.values(uniqueProductsMap);

    // Write unique product objects to output file
    fs.writeFileSync(outputFile, JSON.stringify(uniqueProducts, null, 2), 'utf8');
    console.log(`Extracted ${uniqueProducts.length} unique products for "${identifier}" into ${outputFile}`);
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}