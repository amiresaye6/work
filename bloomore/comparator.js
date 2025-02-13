const fs = require('fs');

// Function to load JSON data from a file
function loadJson(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Function to save JSON data to a file
function saveJson(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

// Function to merge JSON files
function mergeJsonFiles(filePaths, outputFile) {
    const mergedData = {};

    filePaths.forEach((filePath) => {
        const fileName = filePath.split('/').pop(); // Extract file name
        const data = loadJson(filePath);

        data.forEach((item) => {
            const itemId = item.id;

            if (mergedData[itemId]) {
                // If the item already exists, append the file name to mainCategory
                if (!mergedData[itemId].mainCategory.includes(fileName)) {
                    mergedData[itemId].mainCategory.push(fileName);
                }
            } else {
                // If the item is new, add it to the merged data with the file name
                item.mainCategory = [fileName];
                mergedData[itemId] = item;
            }
        });
    });

    // Convert the object back to an array of objects
    const mergedList = Object.values(mergedData);

    // Save the merged data to a new JSON file
    saveJson(mergedList, outputFile);

    console.log(`Merged JSON saved to ${outputFile}`);
}

// File paths of the JSON files to merge
const filePaths = ['المكملات_الغذائية.json', 'تصنيفات_مخصصة_لاحتياجاتك.json', 'مستلزمات_الجمال_و_العناية_الفائقة.json'];

// Output file path
const outputFile = 'merged_file.json';

// Merge the JSON files
mergeJsonFiles(filePaths, outputFile);