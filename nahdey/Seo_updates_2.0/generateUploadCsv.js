const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Check if file names are provided as command-line arguments
if (process.argv.length < 3) {
    console.error('Usage: node generateUploadCsv.js <excel-file1> <excel-file2> ...');
    process.exit(1);
}

// Get the list of Excel file names from command-line arguments
const excelFileNames = process.argv.slice(2);

// Validate and process each file
excelFileNames.forEach(excelFileName => {
    // Validate file extension
    if (!excelFileName.endsWith('.xlsx') && !excelFileName.endsWith('.xls')) {
        console.error(`Error: File "${excelFileName}" must be an Excel file (.xlsx or .xls)`);
        return;
    }

    // Check if the file exists
    if (!fs.existsSync(excelFileName)) {
        console.error(`Error: File "${excelFileName}" not found`);
        return;
    }

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(excelFileName, { cellDates: true });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Transform the data to include only ID and Description (from Seo_description)
        const transformedData = jsonData.map(row => ({
            ID: row.ID || "",
            Description: row.Seo_description || ""
        }));

        // Generate the output CSV file name (upload_{original_name}.csv)
        const outputFileName = `upload_${path.basename(excelFileName, path.extname(excelFileName))}.csv`;

        // Convert the transformed data to CSV format
        const csvData = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(transformedData), { FS: "," });

        // Write the CSV data to a file
        fs.writeFileSync(outputFileName, csvData, 'utf8');

        console.log(`Successfully created "${outputFileName}" from "${excelFileName}"`);
    } catch (error) {
        console.error(`Error processing "${excelFileName}":`, error.message);
    }
});