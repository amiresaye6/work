// // This script finds brands that exist in both input files and creates a new file with matching data

// const fs = require('fs');

// // Mock data for demonstration - replace these with your actual file paths
// const firstFilePath = './skinCare/brandsEn.json';
// const secondFilePath = './pharmacista_brand-analysis.json';
// const outputFilePath = './matchingBrands.json';

// // Read and parse the files
// try {
//     const firstFileData = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
//     const secondFileData = JSON.parse(fs.readFileSync(secondFilePath, 'utf8'));

//     // Extract brand names from first file
//     const firstFileBrands = firstFileData.map(item => item.brand);

//     // Extract brand names from second file (assuming structure from your example)
//     const secondFileBrands = Object.keys(secondFileData.brandBreakdown);

//     // Find matching brands
//     const matchingBrands = [];

//     firstFileBrands.forEach(brand => {
//         if (secondFileBrands.includes(brand)) {
//             // Brand exists in both files
//             const firstFileObject = firstFileData.find(item => item.brand === brand);
//             const secondFileCount = secondFileData.brandBreakdown[brand];

//             // Add to matching brands array
//             matchingBrands.push({
//                 firstFile: firstFileObject,
//                 secondFile: {
//                     name: brand,
//                     count: secondFileCount
//                 }
//             });
//         }
//     });

//     // Create the output file with matching brands
//     const outputData = {
//         matchingBrandsCount: matchingBrands.length,
//         matchingBrands: matchingBrands
//     };

//     // Write the output to a file
//     fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));

//     console.log(`Found ${matchingBrands.length} matching brands`);
//     console.log(`Results saved to ${outputFilePath}`);

// } catch (error) {
//     console.error('Error processing files:', error.message);
// }

// This script finds brands that exist in both input files and creates a new file with matching data

const fs = require('fs');

// Paths to your files - update these with your actual file paths
const firstFilePath = './allBrandsAr.json';
const secondFilePath = './arPharmacista_brand-analysis.json'; // Contains the totalProducts, uniqueBrands, etc.
const outputFilePath = './arMatchingBrands.json';

// Read and parse the files
try {
  const firstFileData = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
  const secondFileData = JSON.parse(fs.readFileSync(secondFilePath, 'utf8'));
  
  // Extract brands from second file (object with brandBreakdown property)
  const secondFileBrands = secondFileData.brandBreakdown;
  
  // Find matching brands
  const matchingBrands = [];
  
  firstFileData.forEach(brandObj => {
    const brandName = brandObj.brand;
    
    // Check if this brand exists in the second file's brandBreakdown
    if (secondFileBrands.hasOwnProperty(brandName)) {
      // Brand exists in both files
      matchingBrands.push({
        firstFile: brandObj,
        secondFile: {
          name: brandName,
          count: secondFileBrands[brandName]
        }
      });
    }
  });
  
  // Sort the matching brands by the second file's count in descending order
  matchingBrands.sort((a, b) => b.secondFile.count - a.secondFile.count);
  
  // Create the output file with matching brands
  const outputData = {
    matchingBrandsCount: matchingBrands.length,
    matchingBrands: matchingBrands
  };
  
  // Write the output to a file
  fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));
  
  console.log(`Found ${matchingBrands.length} matching brands`);
  console.log(`Results sorted by product count (highest first)`);
  console.log(`Results saved to ${outputFilePath}`);
  
} catch (error) {
  console.error('Error processing files:', error.message);
}