const fs = require('fs');

// Load the first JSON file
const file1Data = JSON.parse(fs.readFileSync('id_sku_name_regularPrice_categories.json', 'utf8'));

// Load the second JSON file
const file2Data = JSON.parse(fs.readFileSync('output.json', 'utf8'));

let counter = 0;
const updatedObjects = [];
const newObjects = [];
const newProducts = [];

// Loop through each object in the first JSON file
file1Data.forEach(obj1 => {
    let found = false;
    file2Data.forEach(obj2 => {
        // Check if the Name matches
        if (obj1.Name === obj2.name) {
            found = true;
            counter++;
            // Join the ivitaCategoryAr array with a comma
            const newCategory = [...new Set([...obj1.Categories.split(','), ...obj2.ivitaCategoryAr])].join(', ');
            // Update the Categories field
            obj1.Categories = newCategory;
            updatedObjects.push(obj1);
        }
    });
    if (!found) {
        // If no match is found, add the object to the newObjects list
        newObjects.push(obj1);
    }
});

// Loop through the second JSON file to find products not in the first file
file2Data.forEach(obj2 => {
    let found = false;
    file1Data.forEach(obj1 => {
        if (obj2.name === obj1.Name) {
            found = true;
        }
    });
    if (!found) {
        // If no match is found, add the object to the newProducts list
        newProducts.push(obj2);
    }
});

// Save the updated objects to the updates.json file
fs.writeFileSync('updates.json', JSON.stringify(updatedObjects, null, 4), 'utf8');

// Save the new objects to the notFound.json file
fs.writeFileSync('notFound.json', JSON.stringify(newObjects, null, 4), 'utf8');

// Save the new products to the newproducts.json file
fs.writeFileSync('newproducts.json', JSON.stringify(newProducts, null, 4), 'utf8');

console.log(`Number of matches found: ${counter}`);
console.log(`Number of products in the first file not found in the second file: ${newObjects.length}`);
console.log(`Number of products in the second file not found in the first file: ${newProducts.length}`);
console.log('Updated objects saved to updates.json');
console.log('New objects saved to notFound.json');
console.log('New products saved to newproducts.json');