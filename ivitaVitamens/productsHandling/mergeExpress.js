const fs = require('fs');

// Usage: node merge_isExpress.js file1.json file2.json output.json
const [,, file1Path, file2Path, outputPath] = process.argv;

if (!file1Path || !file2Path || !outputPath) {
  console.error('Usage: node merge_isExpress.js file1.json file2.json output.json');
  process.exit(1);
}

// Read and parse both files
const file1 = JSON.parse(fs.readFileSync(file1Path, 'utf-8'));
const file2 = JSON.parse(fs.readFileSync(file2Path, 'utf-8'));

// Build a lookup map for productId -> isExpress from file1
const expressMap = {};
file1.forEach(obj => {
  expressMap[obj.productId] = obj.isExpress;
});

// Loop over file2 and add isExpress
const merged = file2.map(obj => {
  // Only add if found; otherwise, leave as undefined
  obj.isExpress = expressMap[obj.productId];
  return obj;
});

// Write output
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`Merged file written to ${outputPath}`);