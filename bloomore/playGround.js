const fs = require('fs');
const path = require('path');

// Step 1: Read the original JSON file
const arFile = path.join(__dirname, 'allProductsAr.json'); // Path to your original JSON file
const enFile = path.join(__dirname, 'allProductsEn.json'); // Path to your original JSON file
const newFilePath = path.join(__dirname, 'newBloomorProducts.json'); // Path to save the new JSON file
let limit = 10;

fs.readFile(arFile, 'utf8', (err, arData) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  fs.readFile(enFile, 'utf8', (err, enData) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    try {
      // Parse the JSON data
      const arProducts = JSON.parse(arData);
      const enProducts = JSON.parse(enData);

      const newData = [];


      for (let i = 0; i < arProducts.length; i++) {
        const item = arProducts[i];
        const enItem = enProducts.find(enItem => enItem.id === item.id && enItem.sku === item.sku);
        if (enItem) {
          const newItem = {
            id: item.id || null,
            sku: item.sku || null,
            arabic_name: item.name || null,
            english_name: enItem.name || null,
            arabic_category: item.category?.name || null,
            english_category: enItem.category?.name || null,
            arabic_brand: item.brand?.name || null,
            english_brand: enItem.brand?.name || null,
            regular_price: item.regular_price || null,
            price: item.price || null
          };
          newData.push(newItem);
        }
      }

      fs.writeFile(newFilePath, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
          console.error('Error writing the new file:', err);
          return;
        }
        console.log(`New JSON file created successfully at ${newFilePath}`);
      });
      console.log('finished');

      // Step 2: Extract only the required fields (id, name, regular_price)
      // const newData = arProducts.slice(0, limit).map(item => {
      //   // Ensure all required fields are present
      //   const newItem = {
      //     id: item.id || null,
      //     sku: item.sku || null,
      //     arabic_name: item.name || null,
      //     english_name: item.name || null,
      //     arabic_category: item.category?.name || null,
      //     english_category: item.category?.name || null,
      //     arabic_brand: item.brand?.name || null,
      //     english_brand: item.brand?.name || null,
      //     regular_price: item.regular_price || null,
      //     price: item.price || null
      //   };
      //   return newItem;
      // });

      // // Step 3: Write the new JSON data to a new file
      // fs.writeFile(newFilePath, JSON.stringify(newData, null, 2), (err) => {
      //   if (err) {
      //     console.error('Error writing the new file:', err);
      //     return;
      //   }
      //   console.log(`New JSON file created successfully at ${newFilePath}`);
      // });
    } catch (parseError) {
      console.error('Error parsing the JSON data:', parseError);
    }
  });
});