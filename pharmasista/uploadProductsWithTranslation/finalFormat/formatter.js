// This script reads two CSV files (Arabic and English), matches products by SKU (ignoring ar_/en_ prefix),
// and writes each matched product to the output JSON file one by one (appending), so if it fails you can see where it stopped.

// Uses "csvtojson" (already in your dependencies).

const fs = require('fs');
const csv = require('csvtojson');

function cleanSKU(sku) {
  return (sku || '').replace(/^(ar_|en_)/, '');
}

async function parseCSV(filePath) {
  return await csv().fromFile(filePath);
}

function buildProductJson(arabic, english) {
  return {
    id_arabic: arabic.ID,
    id_english: english.ID,
    sku_arabic: arabic.SKU,
    sku_english: english.SKU,
    name_arabic: arabic.Name,
    name_english: english.Name,
    brand_arabic: arabic.Brands,
    brand_english: english.Brands,
    categories_arabic: arabic.Categories,
    categories_english: english.Categories,
    price_regular: arabic['Regular price'] || english['Regular price'] || "",
    price_sale: arabic['Sale price'] || english['Sale price'] || ""
  };
}

async function mergeCSVFiles(arPath, enPath, outputPath) {
  const arRecords = await parseCSV(arPath);
  const enRecords = await parseCSV(enPath);

  // Build lookup maps by normalized SKU
  const arMap = {};
  arRecords.forEach(rec => {
    if (rec.SKU) arMap[cleanSKU(rec.SKU)] = rec;
  });

  const enMap = {};
  enRecords.forEach(rec => {
    if (rec.SKU) enMap[cleanSKU(rec.SKU)] = rec;
  });

  // Prepare output file: start array
  fs.writeFileSync(outputPath, '[\n', 'utf8');

  let matchedCount = 0;
  let firstEntry = true;
  for (const key of Object.keys(enMap)) {
    if (arMap[key]) {
      try {
        const product = buildProductJson(arMap[key], enMap[key]);
        const productStr = JSON.stringify(product, null, 2);

        if (!firstEntry) {
          fs.appendFileSync(outputPath, ',\n', 'utf8');
        } else {
          firstEntry = false;
        }
        fs.appendFileSync(outputPath, productStr, 'utf8');
        matchedCount++;
        console.log(`Written product with SKU key "${key}" (count: ${matchedCount})`);
      } catch (err) {
        console.error(`Failed to write product with SKU key "${key}":`, err);
        throw err; // Stop on error
      }
    }
  }

  // End array
  fs.appendFileSync(outputPath, '\n]\n', 'utf8');
  console.log(`\nFinished. Merged ${matchedCount} products to ${outputPath}`);
}

// Usage: node formatter.js arabic.csv english.csv output.json

if (require.main === module) {
  const [,, arPath, enPath, outputPath] = process.argv;
  if (!arPath || !enPath || !outputPath) {
    console.log('Usage: node formatter.js <arabic_csv> <english_csv> <output_json>');
    process.exit(1);
  }
  mergeCSVFiles(arPath, enPath, outputPath);
}