const fs = require('fs');

// // Your CSV data as a string
// const csvData = `ID,Name
// 27100,"RICH CREAM for dry skin 250 ml"
// 27113,"RICH CREAM for dry skin 500 ml"
// 27116,"RICH CREAM for dry skin 1000 ml"
// 27119,"CALM CREAM for sensitive skin 1000 ml"
// 27122,"CALM CREAM for sensitive skin 500 ml"
// 27125,"CALM CREAM for sensitive skin 250 ml"
// 27128,"PURESKIN for oily skin"
// 27131,"GLOWSKIN for all skin types"
// 27134,"MOISKIN for dry skin"
// 27137,"REFRESHING SHAMPOO for covered hair"
// 27140,"REFRESHING HAIR SPRAY for covered hair"
// 27144,"BARRIER CREAM body soothing cream"
// 27148,"HYDRA BEBÈ body lotion"
// 27151,"BEBÈ BATH body & hair wash"`;

// // Create a map of product names to IDs
// const nameToId = new Map();
// const csvLines = csvData.split('\n').slice(1); // Skip header
// csvLines.forEach(line => {
//     if (line.trim()) {
//         const [id, nameWithQuotes] = line.split(',', 2);
//         const name = nameWithQuotes.replace(/^"|"$/g, ''); // Remove quotes
//         nameToId.set(name, parseInt(id));
//     }
// });

// // File paths
// const inputJsonFile = '3a lap English SEO description  - Sheet1.json';
// const outputJsonFile = 'updated3a lap English SEO description  - Sheet1.json';

// // Read and process the JSON file
// fs.readFile(inputJsonFile, 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading JSON file:', err);
//         return;
//     }

//     try {
//         const products = JSON.parse(data);

//         // Update each product with its corresponding ID
//         products.forEach(product => {
//             const productName = product['product name'];
//             if (nameToId.has(productName)) {
//                 product.id = nameToId.get(productName);
//             } else {
//                 console.warn(`Warning: No ID found for product: ${productName}`);
//             }
//         });

//         // Write the updated JSON to a new file
//         fs.writeFile(outputJsonFile, JSON.stringify(products, null, 2), 'utf8', (err) => {
//             if (err) {
//                 console.error('Error writing updated JSON file:', err);
//                 return;
//             }
//             console.log(`Updated JSON has been saved to ${outputJsonFile}`);
//         });
//     } catch (parseErr) {
//         console.error('Error parsing JSON:', parseErr);
//     }
// });


fs.readFile("updated3a lap English SEO description  - Sheet1.json", "utf-8", (err, data) => {
    if (err) {
        console.error("Error reading JSON file:", err);
        return;
    }

    try {
        const products = JSON.parse(data);

        products.forEach(element => {
            console.log(element.ID);
            
        });
    } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
    }
}
);