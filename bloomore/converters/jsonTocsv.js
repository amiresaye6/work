const fs = require('fs');
const XLSX = require('xlsx');

const jsonFilePath = 'newBloomorProducts.json'; // Replace with your JSON file path
const excelFilePath = 'newBloomorProducts.xlsx'; // Replace with your desired Excel output path

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data); // Parse the JSON data

    // Convert JSON to Excel
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the Excel file
    XLSX.writeFile(workbook, excelFilePath);
    console.log('Excel file has been saved successfully!');
  } catch (err) {
    console.error('Error parsing JSON or converting to Excel:', err);
  }
});