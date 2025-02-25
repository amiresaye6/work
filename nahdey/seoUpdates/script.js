// // Import the JSON files (Node.js environment)
// const ivitaProductsAr = require('./ivitaProductsAr.json');
// const ivitaProductsEn = require('./ivitaProductsEn.json');
// const updated_products_sku = require('./updated_products_sku.json');
// const fs = require('fs');

// // Function to combine the arrays based on the specified process
// function combineProductData(arData, enData, skuData) {
//   const combinedProducts = [];

//   // Process each product from ivitaProductsAr
//   arData.forEach(arProduct => {
//     let productObj = {
//       arId: arProduct.ID || 'notFound',
//       enId: '',
//       arName: arProduct.Name || 'notFound',
//       seo_arName: '',
//       enName: '',
//       seo_enName: '',
//       arDescription: arProduct.Description || 'notFound',
//       seo_arDescription: '',
//       enDescription: '',
//       seo_enDescription: '',
//       sku: arProduct.SKU || 'notFound',
//       arCategory: arProduct.Categories || 'notFound',
//       enCategory: '',
//       price: ''
//     };

//     // Step 1: If SKU exists in arProduct, find matching enProduct
//     if (arProduct.SKU) {
//       const enMatch = enData.find(en => en.SKU === arProduct.SKU);
//       if (enMatch) {
//         productObj.enId = enMatch.ID || 'notFound';
//         productObj.enName = enMatch.Name || 'notFound';
//         productObj.enDescription = enMatch.Description || 'notFound';
//         productObj.enCategory = enMatch.Categories || 'notFound';
//       }
//       // Check updated_products_sku for additional data
//       const skuMatch = skuData.find(sku => sku.SKU === arProduct.SKU);
//       if (skuMatch) {
//         productObj.arName = skuMatch.arName || productObj.arName;
//         productObj.enName = skuMatch.enName || productObj.enName;
//         productObj.arCategory = skuMatch.category || productObj.arCategory;
//         productObj.price = skuMatch.price || 'notFound';
//       }
//     } else {
//       // Step 2: No SKU in arProduct, find match in updated_products_sku by arName
//       const skuMatch = skuData.find(sku => sku.arName === arProduct.Name);
//       if (skuMatch) {
//         productObj.sku = skuMatch.SKU || 'notFound';
//         productObj.enName = skuMatch.enName || 'notFound';
//         productObj.arCategory = skuMatch.category || productObj.arCategory;
//         productObj.price = skuMatch.price || 'notFound';

//         // Use enName from skuMatch to find enProduct
//         if (skuMatch.enName) {
//           const enMatch = enData.find(en => en.Name === skuMatch.enName);
//           if (enMatch) {
//             productObj.enId = enMatch.ID || 'notFound';
//             productObj.enDescription = enMatch.Description || 'notFound';
//             productObj.enCategory = enMatch.Categories || 'notFound';
//             productObj.sku = enMatch.SKU || productObj.sku; // Update SKU if present
//           }
//         }
//       }
//     }

//     // Add the constructed product object to the result array
//     combinedProducts.push(productObj);
//   });

//   // Step 3: Handle leftover products from updated_products_sku not matched by arData
//   skuData.forEach(skuProduct => {
//     const arMatch = arData.find(ar => ar.SKU === skuProduct.SKU || ar.Name === skuProduct.arName);
//     if (!arMatch) {
//       let productObj = {
//         arId: '',
//         enId: '',
//         arName: skuProduct.arName || 'notFound',
//         seo_arName: '',
//         enName: skuProduct.enName || 'notFound',
//         seo_enName: '',
//         arDescription: '',
//         seo_arDescription: '',
//         enDescription: '',
//         seo_enDescription: '',
//         sku: skuProduct.SKU || 'notFound',
//         arCategory: skuProduct.category || 'notFound',
//         enCategory: '',
//         price: skuProduct.price || 'notFound'
//       };

//       // Try to find enProduct using enName
//       const enMatch = enData.find(en => en.Name === skuProduct.enName);
//       if (enMatch) {
//         productObj.enId = enMatch.ID || 'notFound';
//         productObj.enDescription = enMatch.Description || 'notFound';
//         productObj.enCategory = enMatch.Categories || 'notFound';
//         productObj.sku = enMatch.SKU || productObj.sku; // Update SKU if present
//       }

//       combinedProducts.push(productObj);
//     }
//   });

//   return combinedProducts;
// }

// // Combine the data
// const combinedProducts = combineProductData(ivitaProductsAr, ivitaProductsEn, updated_products_sku);

// // Save the result to a file
// fs.writeFileSync('combined_products.json', JSON.stringify(combinedProducts, null, 2), 'utf8');
// console.log('Combined products saved to combined_products.json');




// Import required modules
const fs = require('fs');
const XLSX = require('xlsx');

// Load the JSON file
const ivitaProductsAr = require('./ivitaProductsEn.json');

// Define the main categories in Arabic
const mainCategories = [
  'General Health',
  "Women Health",
  "Men Health",
  "Children's Health",
  "Sports and Fitness",
  "Healthy Foods",
  "Shopping by vitamins"

];

// Define the main categories in Arabic
// const mainCategories = [
//   'الصحة العامة',
//   'صحة المرأة',
//   'صحة الرجل',
//   'صحة الاطفال',
//   'الرياضة واللياقة البدنية',
//   'الأطعمة الصحية',
//   'تسوق حسب الفيتامينات'
// ];

// Function to create separate Excel files based on categories
function createExcelFilesByCategory(data) {
  const categoryData = {};
  mainCategories.forEach(category => {
    categoryData[category] = [];
  });
  categoryData['uncategorized'] = []; // Add an "Uncategorized" category
  // categoryData['غير_مصنف'] = []; // Add an "Uncategorized" category

  const processedIds = new Set();

  data.forEach(product => {
    if (processedIds.has(product.ID)) return;

    const categories = product.Categories.split(',').map(cat => cat.trim());
    let assigned = false;

    for (const mainCategory of mainCategories) {
      if (categories.some(cat => cat.includes(mainCategory))) {
        categoryData[mainCategory].push({
          ID: product.ID || '',
          SKU: product.SKU || '',
          Name: product.Name || '',
          Description: product.Description || '',
          Seo_name: '',
          Seo_description: ''
        });
        processedIds.add(product.ID);
        assigned = true;
        break;
      }
    }

    // If no main category matches, add to "غير_مصنف"
    if (!assigned) {
      categoryData['uncategorized'].push({
      // categoryData['غير_مصنف'].push({
        ID: product.ID || '',
        SKU: product.SKU || '',
        Name: product.Name || '',
        Description: product.Description || '',
        Seo_name: '',
        Seo_description: ''
      });
      processedIds.add(product.ID);
    }
  });

  // Generate Excel files for all categories, including "غير_مصنف"
  Object.keys(categoryData).forEach(category => {
    if (categoryData[category].length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(categoryData[category]);
      worksheet['!cols'] = [
        { wch: 10 }, // ID
        { wch: 15 }, // SKU
        { wch: 50 }, // Name
        { wch: 100 }, // Description
        { wch: 50 }, // Seo_name
        { wch: 100 } // Seo_description
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      const fileName = `${category.replace(/ /g, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      console.log(`Excel file "${fileName}" created with ${categoryData[category].length} products.`);
    } else {
      console.log(`No products found for category "${category}".`);
    }
  });
}

// Execute the function
createExcelFilesByCategory(ivitaProductsAr);