const csv = require('csvtojson');
const fs = require('fs');

const csvFilePath = 'BackUP___wc-product-export-15-4-2025-1744724765391.csv'; // Replace with your CSV file path
const jsonFilePath = 'BackUP___wc-product-export-15-4-2025-1744724765391.json'; // Replace with your desired JSON output path

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    // Convert the JSON object to a string with pretty-printing
    const jsonString = JSON.stringify(jsonObj, null, 2);

    // Write the JSON string to a file
    fs.writeFile(jsonFilePath, jsonString, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log('JSON file has been saved successfully!');
      }
    });
  })
  .catch((err) => {
    console.error('Error converting CSV to JSON:', err);
  });