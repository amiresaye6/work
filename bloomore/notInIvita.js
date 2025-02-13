const fs = require('fs');

// Function to load JSON data from a file
function loadJson(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Function to save JSON data to a file
function saveJson(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

// Function to filter products that are not in the second file
function filterUnuploadedProducts(firstFilePath, secondFilePath, outputFilePath) {
    // Load the first JSON file (products to check)
    const firstFileData = loadJson(firstFilePath);

    // Load the second JSON file (already uploaded products)
    const secondFileData = loadJson(secondFilePath);

    // Create a Set of all product names from the second file for quick lookup
    const uploadedProductNames = new Set(secondFileData.map(product => product.Name));

    // Filter products from the first file that are not in the second file
    const unuploadedProducts = firstFileData.filter(product => !uploadedProductNames.has(product.name));

    // Save the filtered products to a new JSON file
    saveJson(unuploadedProducts, outputFilePath);

    console.log(`Filtered products saved to ${outputFilePath}`);
}

// File paths
const firstFilePath = 'merged_file.json'; // Path to the first JSON file
const secondFilePath = 'ivitaProducts.json'; // Path to the second JSON file
const outputFilePath = 'unuploaded_products.json'; // Path to save the filtered products

// Filter and save unuploaded products
filterUnuploadedProducts(firstFilePath, secondFilePath, outputFilePath);