const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const xlsx = require('xlsx');

// Get command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log('Usage: node convertData.js <inputFile> [outputFile] [options]');
    console.log('Options:');
    console.log('  --csv, -c    Convert to CSV format');
    console.log('  --json, -j   Convert to JSON format');
    console.log('  --xlsx, -x   Convert to Excel format');
    console.log('  --help, -h   Show this help message');
    console.log('Supported input formats: json, csv, xlsx');
    process.exit(1);
}

// Extract input file and format flags
let inputFilePath = null;
let outputFilePath = null;
let forcedOutputFormat = null;

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Check for format flags
    if (arg === '--csv' || arg === '-c') {
        forcedOutputFormat = 'csv';
        continue;
    }
    if (arg === '--json' || arg === '-j') {
        forcedOutputFormat = 'json';
        continue;
    }
    if (arg === '--xlsx' || arg === '-x') {
        forcedOutputFormat = 'xlsx';
        continue;
    }

    // First non-flag argument is input file
    if (!inputFilePath) {
        inputFilePath = arg;
        continue;
    }

    // Second non-flag argument is output file
    if (!outputFilePath) {
        outputFilePath = arg;
        continue;
    }
}

if (!inputFilePath) {
    console.error('Error: Input file is required');
    process.exit(1);
}

// Get current date and time formatted as YYYY-MM-DD HH:MM:SS
const getCurrentDateTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Extract file information
const inputFileInfo = path.parse(inputFilePath);
const inputFormat = inputFileInfo.ext.toLowerCase().slice(1);

// Determine output format and file path
let outputFormat;

if (outputFilePath) {
    // If output file is specified, get its format
    const outputFileInfo = path.parse(outputFilePath);
    outputFormat = outputFileInfo.ext.toLowerCase().slice(1);
} else {
    // If no output file is specified, use forced format or determine based on input
    if (forcedOutputFormat) {
        outputFormat = forcedOutputFormat;
    } else {
        // Automatic format conversion if no flag is specified
        switch (inputFormat) {
            case 'json':
                outputFormat = 'csv';
                break;
            case 'csv':
                outputFormat = 'json';
                break;
            case 'xlsx':
                outputFormat = 'json';
                break;
            default:
                outputFormat = 'csv'; // Default to CSV if format is unknown
        }
    }

    // Generate output filename with date and time
    const currentDateTime = getCurrentDateTime();
    outputFilePath = `${inputFileInfo.dir}/${inputFileInfo.name}_${currentDateTime}.${outputFormat}`;
}

// Read and convert the input file
const convertFile = () => {
    try {
        let data;

        // Read input based on format
        if (inputFormat === 'json') {
            const fileContent = fs.readFileSync(inputFilePath, 'utf8');
            data = JSON.parse(fileContent);
        } else if (inputFormat === 'csv') {
            const fileContent = fs.readFileSync(inputFilePath, 'utf8');
            // Parse CSV to JSON using xlsx
            const workbook = xlsx.read(fileContent, { type: 'string' });
            data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else if (inputFormat === 'xlsx') {
            const workbook = xlsx.readFile(inputFilePath);
            data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
            throw new Error(`Unsupported input format: ${inputFormat}`);
        }

        // Write output based on format
        if (outputFormat === 'json') {
            fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), 'utf8');
        } else if (outputFormat === 'csv') {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(data);
            fs.writeFileSync(outputFilePath, csv, 'utf8');
        } else if (outputFormat === 'xlsx') {
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            xlsx.writeFile(workbook, outputFilePath);
        } else {
            throw new Error(`Unsupported output format: ${outputFormat}`);
        }

        console.log(`Conversion successful! ${inputFormat.toUpperCase()} has been converted to ${outputFormat.toUpperCase()}`);
        console.log(`Output file: ${outputFilePath}`);
    } catch (error) {
        console.error(`Error converting file: ${error.message}`);
    }
};

// Check if the input file exists
if (!fs.existsSync(inputFilePath)) {
    console.error(`Input file not found: ${inputFilePath}`);
} else {
    convertFile();
}