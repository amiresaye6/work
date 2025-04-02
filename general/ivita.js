const xlsx = require('xlsx');
const fs = require('fs').promises; // Using promises version of fs for async/await

// Function to convert Excel to JSON
async function convertExcelToJson(excelFilePath, jsonFilePath) {
    try {
        // Input validation
        if (!excelFilePath || !jsonFilePath) {
            throw new Error('Excel file path and JSON file path are required');
        }

        if (typeof excelFilePath !== 'string' || typeof jsonFilePath !== 'string') {
            throw new Error('File paths must be strings');
        }

        // Check if Excel file exists
        await fs.access(excelFilePath).catch(() => {
            throw new Error(`Excel file not found at: ${excelFilePath}`);
        });

        // Read the Excel file
        const workbook = xlsx.readFile(excelFilePath);

        // Check if workbook has sheets
        if (!workbook.SheetNames.length) {
            throw new Error('No sheets found in the Excel file');
        }

        // Get the last sheet name
        const sheetName = workbook.SheetNames[workbook.SheetNames.length - 1];
        
        // Verify sheet exists
        if (!workbook.Sheets[sheetName]) {
            throw new Error(`Sheet '${sheetName}' not found in workbook`);
        }

        // Convert the sheet to JSON
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
            defval: null, // Default value for empty cells
            blankrows: false // Skip blank rows
        });

        // Write JSON data to a file
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

        console.log(`Excel file successfully converted to JSON and saved to ${jsonFilePath}`);
        return jsonData; // Return the data if needed

    } catch (error) {
        console.error('Error converting Excel to JSON:', error.message);
        throw error; // Re-throw the error for handling by the caller if needed
    }
}

// Example usage with async/await
(async () => {
    const excelFilePath = './ivitaProducts.xlsx';
    const jsonFilePath = './ivitaProducts.json';

    try {
        await convertExcelToJson(excelFilePath, jsonFilePath);
    } catch (error) {
        console.error('Conversion failed:', error.message);
    }
})();