const fs = require('fs');

// Step 1: Read the original JSON file
const originalFilePath = 'ivitaProducts.json'; // Path to your original JSON file
const newFilePath = 'ivitaNames.json'; // Path to save the new JSON file

fs.readFile(originalFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  try {
    // Parse the JSON data
    const originalData = JSON.parse(data);

    // Step 2: Extract only the required fields (id, name, regular_price)
    const newData = originalData.map(item => ({
      name: item.Name,
    }));

    // Step 3: Write the new JSON data to a new file
    fs.writeFile(newFilePath, JSON.stringify(newData, null, 2), (err) => {
      if (err) {
        console.error('Error writing the new file:', err);
        return;
      }
      console.log(`New JSON file created successfully at ${newFilePath}`);
    });
  } catch (parseError) {
    console.error('Error parsing the JSON data:', parseError);
  }
});