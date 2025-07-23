const fs = require('fs');

// Usage: node extract_unique_category_rows.js input.json output.json
const [,, inputFile, outputFile] = process.argv;
if (!inputFile || !outputFile) {
  console.error('Usage: node extract_unique_category_rows.js input.json output.json');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Use a Set to store unique rows as string keys
const uniqueSet = new Set();
const uniqueRows = [];

products.forEach(prod => {
  // up to 3 levels; expand if needed
  const row = {
    main_category_en: prod.categories_en?.[0] || "",
    main_category_ar: prod.categories_ar?.[0] || "",
    sub_category_en: prod.categories_en?.[1] || "",
    sub_category_ar: prod.categories_ar?.[1] || "",
    sub_sub_category_en: prod.categories_en?.[2] || "",
    sub_sub_category_ar: prod.categories_ar?.[2] || ""
  };
  // Stringify for uniqueness (order matters)
  const key = JSON.stringify(row);
  if (!uniqueSet.has(key)) {
    uniqueSet.add(key);
    uniqueRows.push(row);
  }
});

fs.writeFileSync(outputFile, JSON.stringify(uniqueRows, null, 2), 'utf-8');
console.log(`Unique category rows written to ${outputFile}`);