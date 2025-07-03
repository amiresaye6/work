// This script reads scraped_product_details.json and extracts all unique categories in 'ar' and 'en' (first two only), then outputs them as an array of {ar, en} objects.

const fs = require('fs');

// Load the input file
const data = JSON.parse(fs.readFileSync('scraped_product_details.json', 'utf-8'));

// Set to store unique pairs
const uniquePairs = new Set();

// Loop over each product
for (const product of Array.isArray(data) ? data : [data]) {
  const catsEn = product.categories_en || [];
  const catsAr = product.categories_ar || [];
  // Only consider the first two items from each categories array
  for (let i = 0; i < 2; i++) {
    if (catsEn[i] && catsAr[i]) {
      // Use a separator unlikely to appear in real data to make a unique key
      uniquePairs.add(`${catsAr[i]}|||${catsEn[i]}`);
    }
  }
}

// Convert the set to an array of objects
const result = Array.from(uniquePairs).map(pair => {
  const [ar, en] = pair.split('|||');
  return { ar, en };
});

// Write to file
fs.writeFileSync('unique_categories.json', JSON.stringify(result, null, 2), 'utf-8');
console.log(`Extracted ${result.length} unique categories to unique_categories.json`);