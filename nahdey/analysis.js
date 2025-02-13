const fs = require('fs');

// Load the JSON file
const data = JSON.parse(fs.readFileSync('output.json', 'utf8'));

// Initialize objects to store category counts and object counts based on the number of categories
const categoryCounts = {};
const objectCountsByCategoryNumber = {};

// Loop through each object in the JSON file
data.forEach(obj => {
  // Get the ivitaCategoryEn array
  const categories = obj.ivitaCategoryEn || [];

  // Count the number of categories in this object
  const numCategories = categories.length;

  // Update the objectCountsByCategoryNumber object
  if (!objectCountsByCategoryNumber[numCategories]) {
    objectCountsByCategoryNumber[numCategories] = 0;
  }
  objectCountsByCategoryNumber[numCategories]++;

  // Loop through each category in the ivitaCategoryEn array
  categories.forEach(category => {
    // Update the categoryCounts object
    if (!categoryCounts[category]) {
      categoryCounts[category] = 0;
    }
    categoryCounts[category]++;
  });
});

// Prepare the output object
const output = {
  categoryCounts,
  objectCountsByCategoryNumber
};

// Save the output to a JSON file
fs.writeFileSync('analysis_output.json', JSON.stringify(output, null, 4), 'utf8');

console.log('Analysis completed. Results saved to analysis_output.json');