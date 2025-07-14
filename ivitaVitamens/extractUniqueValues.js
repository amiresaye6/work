/**
 * Script to extract all unique values for a given identifier from a JSON file.
 * 
 * Usage:
 *   node extractUniqueValues.js input.json identifier output.json
 * 
 * Example:
 *   node extractUniqueValues.js products.json brand products_unique.json
 * 
 * This will look for the key "brand" in each object of products.json,
 * collect all unique values, and write them to products_unique.json as an array.
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

    // Collect values for the identifier key
    const values = (Array.isArray(data) ? data : Object.values(data))
        .map(item => item[identifier])
        .filter(val => typeof val !== 'undefined' && val !== null);

    // Get unique values
    const uniqueValues = Array.from(new Set(values));

    // Write unique values to output file
    fs.writeFileSync(outputFile, JSON.stringify(uniqueValues, null, 2), 'utf8');
    console.log(`Extracted ${uniqueValues.length} unique values for "${identifier}" into ${outputFile}`);
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}