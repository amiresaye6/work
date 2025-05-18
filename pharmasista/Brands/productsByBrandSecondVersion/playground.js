// const fs = require('fs').promises;
// const { equal } = require('assert');
// const path = require('path');

// async function loadBrands(jsonFile = 'test.json') {
//     try {
//         const data = await fs.readFile(jsonFile, 'utf8');
//         const brands = JSON.parse(data);
//         let arCount = 0
//         let enCount = 0
//         let equal = 0
//         brands.forEach(brand => {
//             brand.arabicSimilarityScore > brand.englishSimilarityScore ? arCount += 1 : brand.arabicSimilarityScore < brand.englishSimilarityScore ? enCount +=1 : equal += 1;

//         });
//         console.log(
//             `
//             Arabic Similarity Score: ${arCount} \n
//             English Similarity Score: ${enCount} \n
//             Equal Similarity Score: ${equal} \n
//             `
//         );
        
//     } catch (error) {
//         console.log(`Error loading ${jsonFile}: ${error.message}`);
//         return [];
//     }
// }


// loadBrands()


const fs = require('fs');

const inputFilepath = './expreeProducts.json';
const outputFilePath = './deduplicated_products.json';

// Read and parse the file
try {
    console.log("Starting deduplication process");
    const products = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));
    
    // Track seen productIds and unique products
    const uniqueProductIds = new Map();
    const uniqueProducts = [];
    let duplicatesCount = 0;
    
    // Filter out duplicates based on productId
    products.forEach(product => {
        if (!uniqueProductIds.has(product.productId)) {
            uniqueProductIds.set(product.productId, true);
            uniqueProducts.push(product);
        } else {
            duplicatesCount++;
        }
    });

    // Write the output to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(uniqueProducts, null, 2));

    console.log(`Deduplication complete. Found ${duplicatesCount} duplicates.`);
    console.log(`Results saved to ${outputFilePath}`);

} catch (error) {
    console.error('Error processing files:', error.message);
}