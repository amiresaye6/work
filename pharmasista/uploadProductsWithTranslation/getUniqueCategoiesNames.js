/**
 * Script to extract unique category names (both Arabic and English) from a JSON file of products.
 * 
 * - Reads products from 'products.json' (must be in the same directory).
 * - Assumes each product may have category info in English and Arabic, either as properties or nested fields.
 * - Builds a Set of unique Arabic and English category names found in the file.
 * - Writes them to 'categories_ar.txt' and 'categories_en.txt'.
 * 
 * Adjust the property names below if your categories are present in a different field!
 */

const fs = require('fs');

// Adjust this if your categories are in a different property or nested location
function extractCategories(product) {
  // Try to handle different possible locations for categories
  // Example: product.categories_en, product.categories_ar, product.categories, product.category, etc.
  let categoriesEn = [];
  let categoriesAr = [];

  // Check common places for English categories
  if (Array.isArray(product.categories_en)) categoriesEn = product.categories_en;
  else if (typeof product.categories_en === "string") categoriesEn = product.categories_en.split(',').map(s => s.trim());

  // Fallback: check for 'category' or 'categories' in English
  if (categoriesEn.length === 0 && typeof product.category === "string") categoriesEn = [product.category];
  if (categoriesEn.length === 0 && Array.isArray(product.category)) categoriesEn = product.category;

  // Check common places for Arabic categories
  if (Array.isArray(product.categories_ar)) categoriesAr = product.categories_ar;
  else if (typeof product.categories_ar === "string") categoriesAr = product.categories_ar.split(',').map(s => s.trim());

  // Fallback: check for 'categoryAr' or 'categoriesAr'
  if (categoriesAr.length === 0 && typeof product.categoryAr === "string") categoriesAr = [product.categoryAr];
  if (categoriesAr.length === 0 && Array.isArray(product.categoryAr)) categoriesAr = product.categoryAr;

  // Some sites may have only one language - fallback to empty array if not found
  return { categoriesEn, categoriesAr };
}

// Main
function main() {
  // Read the products
  const inputFile = 'scraped_product_details.json';
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  const categoriesEnSet = new Set();
  const categoriesArSet = new Set();

  products.forEach(product => {
    const { categoriesEn, categoriesAr } = extractCategories(product);

    categoriesEn.forEach(cat => {
      if (cat && cat.length > 0) categoriesEnSet.add(cat);
    });
    categoriesAr.forEach(cat => {
      if (cat && cat.length > 0) categoriesArSet.add(cat);
    });
  });

  // Write results
  fs.writeFileSync('categories/categories_en.txt', [...categoriesEnSet].sort().join('\n'), 'utf8');
  fs.writeFileSync('categories/categories_ar.txt', [...categoriesArSet].sort().join('\n'), 'utf8');
  console.log(`Extracted ${categoriesEnSet.size} unique English categories and ${categoriesArSet.size} unique Arabic categories.`);
  console.log(`See categories_en.txt and categories_ar.txt`);
}

main();