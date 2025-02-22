const fs = require("fs");

// Load JSON files
const firstFile = JSON.parse(fs.readFileSync("sku_products.json", "utf8"));
const secondFile = JSON.parse(fs.readFileSync("id_sku_name_regularPrice_categories.json", "utf8"));

// Create a lookup table from the first file using Arabic name as the key
const productLookup = {};
firstFile.forEach((product) => {
  productLookup[product.name.ar] = {
    SKU: product.sku.en, // SKU from the first file
    enName: product.name.en, // English name
    price: product.price.en, // Price in English
  };
});

// Process the second file and update missing SKUs
const updatedProducts = secondFile
  .filter((product) => !product.SKU) // Only process products with missing SKUs
  .map((product) => {
    const match = productLookup[product.Name]; // Find a match by Arabic name

    if (match) {
      return {
        ID: product.ID,
        SKU: match.SKU,
        arName: product.Name, // Arabic name from second file
        enName: match.enName, // English name from first file
        price: match.price, // Price from first file (in English)
        category: product.Categories, // Category from second
      };
    }

    return null; // Ignore unmatched products
  })
  .filter(Boolean); // Remove null values

// Save the result
fs.writeFileSync("updated_products_sku.json", JSON.stringify(updatedProducts, null, 2), "utf8");

console.log("✅ Updated file saved as 'updated_products.json'");
