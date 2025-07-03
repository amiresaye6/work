// This script combines all JSON arrays from the specified directory into one output file.
// Place this file outside the `seoAiUpdate` directory, or update the folder path as needed.

const fs = require('fs');
const path = require('path');

// Directory containing your JSON files
const folderPath = path.join(__dirname, 'uploads');

// Output file path
const outputFile = path.join(__dirname, 'combined_ar.json');

// Read all JSON files in the directory
const files = fs.readdirSync(folderPath).filter(f => /^products[1-9]\d?_ar.*\.json$/.test(f));
// const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

let combined = [];

for (const file of files) {
  const filePath = path.join(folderPath, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const arr = JSON.parse(content);

    if (Array.isArray(arr)) {
      combined = combined.concat(arr);
    } else {
      console.warn(`File ${file} is not an array, skipping.`);
    }
  } catch (e) {
    console.error(`Could not parse ${file}:`, e.message);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Combined ${files.length} files into ${outputFile}`);