const fs = require('fs');

// Adjust this if your categories are in a different property or nested location
function extractCategories(product) {
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

  return { categoriesEn, categoriesAr };
}

// Load existing categories from file if they exist
function loadExistingCategories(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return new Set(fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim()));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return new Set();
}

// Main
function main() {
  // Read the products
  const inputFile = 'scraped_product_details.json';
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  const categoriesEnSet = new Set();
  const categoriesArSet = new Set();

  // Extract categories from products
  products.forEach(product => {
    const { categoriesEn, categoriesAr } = extractCategories(product);

    categoriesEn.forEach(cat => {
      if (cat && cat.length > 0) categoriesEnSet.add(cat);
    });
    categoriesAr.forEach(cat => {
      if (cat && cat.length > 0) categoriesArSet.add(cat);
    });
  });

  // Load existing categories
  const existingEnCategories = loadExistingCategories('categories/categories_en.txt');
  const existingArCategories = loadExistingCategories('categories/categories_ar.txt');

  // Identify new categories
  const newCategoriesEn = new Set([...categoriesEnSet].filter(cat => !existingEnCategories.has(cat)));
  const newCategoriesAr = new Set([...categoriesArSet].filter(cat => !existingArCategories.has(cat)));

  // Write all categories (existing + new)
  fs.writeFileSync('categories/categories_en.txt', [...categoriesEnSet].sort().join('\n'), 'utf8');
  fs.writeFileSync('categories/categories_ar.txt', [...categoriesArSet].sort().join('\n'), 'utf8');

  // Write new categories only
  fs.writeFileSync('categories/new_categories_en.txt', [...newCategoriesEn].sort().join('\n'), 'utf8');
  fs.writeFileSync('categories/new_categories_ar.txt', [...newCategoriesAr].sort().join('\n'), 'utf8');

  // Log results
  console.log(`Updated categories: ${categoriesEnSet.size} unique English, ${categoriesArSet.size} unique Arabic.`);
  console.log(`New categories: ${newCategoriesEn.size} English, ${newCategoriesAr.size} Arabic.`);
  console.log(`See categories_en.txt, categories_ar.txt for all categories`);
  console.log(`See new_categories_en.txt, new_categories_ar.txt for new categories`);
}

main();