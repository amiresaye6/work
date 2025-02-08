const { Parser } = require('json2csv');
const fs = require('fs');

const jsonFilePath = 'id_sku_name_regularPrice_categories.json'; // Replace with your JSON file path
const csvFilePath = 'id_sku_name_regularPrice_categories.csv'; // Replace with your desired CSV output path

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data); // Parse the JSON data

    // Convert JSON to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(jsonData);

    // Write the CSV to a file
    fs.writeFile(csvFilePath, csv, (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
      } else {
        console.log('CSV file has been saved successfully!');
      }
    });
  } catch (err) {
    console.error('Error parsing JSON or converting to CSV:', err);
  }
});