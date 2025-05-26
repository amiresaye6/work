{/*
    first script to combine the two fiels object of nahdi categories for further analysis
*/}

const fs = require('fs');

const firstFilePath = './wc-product-export-21-5-2025-1747820243547_2025-05-21_12-38-40.json'
const secondFilePath = './seoDescription.json'
const outputFilePath = './t123.json'

// Read and parse the files
try {
    console.log("hi")
    const firstFile  = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
    const secondFile  = JSON.parse(fs.readFileSync(secondFilePath, 'utf8'));

    let expressProducts = [];

    expressProducts = firstFile.filter(product => product && !product.Description)
    // expressProducts = firstFile.filter(product => product && product.Description && typeof product.Description === 'string' && (product.Description.includes('✔️') || product.Description.includes("✅") || product.Description.includes("#")))
    // Find matching brands

    // Write the output to a file
    // fs.writeFileSync(outputFilePath, JSON.stringify(expressProducts, null, 2));


    console.log(`Results saved to ${expressProducts.length}`);

} catch (error) {
    console.error('Error processing files:', error.message);
}

