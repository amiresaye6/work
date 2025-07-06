const fs = require('fs');

const filter = () => {
    const fileName = 'combined_ar_manual_mapping_2025-07-03_17-15-24_2025-07-06_12-57-02.json';
    // Read and parse the JSON file
    const rawData = fs.readFileSync(fileName, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Map to only include SKU and Category fields
    const filteredData = data.map(product => ({
        SKU: product.SKU, 
        Category: product.Categories
    }));
    
    // Write the filtered data back to a file
    const outputFileName = 'filtered_products.json';
    fs.writeFileSync(outputFileName, JSON.stringify(filteredData, null, 2), 'utf-8');
    
    console.log(`Done filtering ${data.length} products. Output saved to ${outputFileName}`);
}

filter();