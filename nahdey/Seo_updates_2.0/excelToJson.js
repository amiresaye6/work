const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Check if a file name is provided as a command-line argument
if (process.argv.length < 3) {
    console.error('Usage: node excelToJson.js <excel-file-name>');
    process.exit(1);
}

// Get the Excel file name from command-line argument
const excelFileName = process.argv[2];

// Validate file extension
if (!excelFileName.endsWith('.xlsx') && !excelFileName.endsWith('.xls')) {
    console.error('Error: File must be an Excel file (.xlsx or .xls)');
    process.exit(1);
}

// Check if the file exists
if (!fs.existsSync(excelFileName)) {
    console.error(`Error: File "${excelFileName}" not found`);
    process.exit(1);
}

try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelFileName, { cellDates: true });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Generate the output JSON file name (same as input but with .json extension)
    const jsonFileName = path.basename(excelFileName, path.extname(excelFileName)) + '.json';

    // Write the JSON data to a file
    fs.writeFileSync(jsonFileName, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`Successfully converted "${excelFileName}" to "${jsonFileName}"`);
} catch (error) {
    console.error('Error during conversion:', error.message);
    process.exit(1);
}