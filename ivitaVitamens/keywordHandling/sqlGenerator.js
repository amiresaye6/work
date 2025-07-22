const fs = require('fs');

/*
input file objects shape 
[
  { "productId": 123, "keywordKey": "Focus Keyword 1" },
  { "productId": 456, "keywordKey": "Focus Keyword 2" }
]

*/

// Get input and output file names from command line
const [, , inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
    console.error('Usage: node init_generate_sql.js input.json output.sql');
    process.exit(1);
}

// Read and parse input JSON file
let products;
try {
    products = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
} catch (err) {
    console.error('Error reading or parsing input file:', err.message);
    process.exit(1);
}

function escapeSql(val) {
    return String(val).replace(/'/g, "''");
}

const sqlStatements = products.map(prod => {
    const productId = prod.productId;
    const keywordKey = prod.keywordKey;
    if (!productId || !keywordKey) {
        return null;
    }
    return `INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (${productId}, '_rank_math_focus_keyword', '${escapeSql(keywordKey)}');`;
}).filter(Boolean);

try {
    fs.writeFileSync(outputFile, sqlStatements.join('\n'), 'utf-8');
    console.log(`SQL file generated: ${outputFile}`);
} catch (err) {
    console.error('Error writing output file:', err.message);
    process.exit(1);
}