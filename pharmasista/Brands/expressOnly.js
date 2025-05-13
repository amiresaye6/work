const fs = require('fs');

const inputFilepath = './all_brands_and_products_combined.json';
const outputFilePath = './expreeProducts.json';

// Read and parse the files
try {
    const inputFile = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'));

    // Extract brands from second file (object with brandBreakdown property)
    const products = inputFile.products;

    // Find matching brands
    let expressProducts = [];

    expressProducts = products.filter(product => product.isExpress === true);

    // firstFileData.forEach(brandObj => {
    //     const brandName = brandObj.brand;

    //     // Check if this brand exists in the second file's brandBreakdown
    //     if (secondFileBrands.hasOwnProperty(brandName)) {
    //         // Brand exists in both files
    //         matchingBrands.push({
    //             firstFile: brandObj,
    //             secondFile: {
    //                 name: brandName,
    //                 count: secondFileBrands[brandName]
    //             }
    //         });
    //     }
    // });

    // // Sort the matching brands by the second file's count in descending order
    // matchingBrands.sort((a, b) => b.secondFile.count - a.secondFile.count);

    // // Create the output file with matching brands
    // const outputData = {
    //     matchingBrandsCount: matchingBrands.length,
    //     matchingBrands: matchingBrands
    // };

    // Write the output to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(expressProducts, null, 2));


    console.log(`Results saved to ${outputFilePath}`);

} catch (error) {
    console.error('Error processing files:', error.message);
}