const xlsx = require('xlsx');
const fs = require('fs').promises;

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

        if (!workbook.SheetNames.length) {
            throw new Error('No sheets found in the Excel file');
        }

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            throw new Error(`Sheet '${sheetName}' not found in workbook`);
        }

        // Convert sheet to JSON, using row 6 (index 5) as header
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            defval: null,          // Default value for empty cells
            blankrows: false,      // Skip blank rows
            header: 'A',          // Use A, B, C... as temporary column names
            range: 6              // Start from row 6 (0-based index, so 5)
        });

        // Get the header row (first row of our data, which is originally row 6)
        const headers = xlsx.utils.sheet_to_json(worksheet, {
            header: 1,           // Get raw values
            range: 5,           // Get only row 5 (0-based index, row 6 in Excel)
            raw: true
        })[0];

        // Remap the data using the actual headers from row 6
        const remappedData = jsonData.map(row => {
            const newRow = {};
            Object.keys(row).forEach((key, index) => {
                const headerName = headers[index];
                // Only include if header exists and isn't empty
                if (headerName && headerName.toString().trim()) {
                    newRow[headerName] = row[key];
                }
            });
            return newRow;
        });

        // Write JSON data to a file
        await fs.writeFile(jsonFilePath, JSON.stringify(remappedData, null, 2), 'utf-8');

        console.log(`Excel file successfully converted to JSON and saved to ${jsonFilePath}`);
        return remappedData;

    } catch (error) {
        console.error('Error converting Excel to JSON:', error.message);
        throw error;
    }
}

// Example usage
(async () => {
    const excelFilePath = './sadaDiscounts.xlsx';
    const jsonFilePath = './sadaDiscounts.json';

    try {
        await convertExcelToJson(excelFilePath, jsonFilePath);
    } catch (error) {
        console.error('Conversion failed:', error.message);
    }
})();