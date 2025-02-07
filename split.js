const fs = require('fs');
const path = require('path');

// Read JSON file
const rawData = fs.readFileSync('output.json', 'utf8'); // Change 'data.json' to your actual filename
const items = JSON.parse(rawData);

// Object to store grouped data
const groupedData = {};

// Group items by baseUrl
items.forEach(item => {
    const baseUrl = item.baseUrl;
    
    if (!groupedData[baseUrl]) {
        groupedData[baseUrl] = [];
    }

    groupedData[baseUrl].push(item);
});

// Process and save grouped data
Object.entries(groupedData).forEach(([baseUrl, items]) => {
    // Get the folder name from ivitaCategoryEn (using the first category)
    const folderName = items[0].ivitaCategoryEn[0].replace(/[^a-zA-Z0-9-_ ]/g, '_'); // Replace special characters

    // Create the folder if it doesn't exist
    const folderPath = path.join(__dirname, folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Create a JSON file inside the folder
    const filePath = path.join(folderPath, 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');

    console.log(`Saved: ${filePath}`);
});

console.log("✅ JSON files created successfully!");
