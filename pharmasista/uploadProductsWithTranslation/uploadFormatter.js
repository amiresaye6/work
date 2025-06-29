const fs = require('fs');

// Helper to extract only the direct image URL, stripping all params and decoding if from /_next/image
function extractDirectImage(url) {
  if (typeof url !== "string") return url;
  if (url.startsWith("https://www.nahdionline.com/_next/image")) {
    try {
      const parsed = new URL(url);
      const realUrl = decodeURIComponent(parsed.searchParams.get("url") || "");
      const match = realUrl.match(/^(.*?\.(jpg|jpeg|png|webp|gif|bmp))/i);
      return match ? match[1] : realUrl;
    } catch (e) {
      return url;
    }
  }
  const match = url.match(/^(.*?\.(jpg|jpeg|png|webp|gif|bmp))/i);
  return match ? match[1] : url;
}

function joinCategories(categories) {
  if (Array.isArray(categories)) return categories.join(', ');
  return typeof categories === "string" ? categories : "";
}

function joinImages(images) {
  if (Array.isArray(images)) return images.join(', ');
  return typeof images === "string" ? images : "";
}

// Loads category mappings and returns two lookup maps (EN, AR)
function loadCategoryMaps(filepath) {
  const mappingArr = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const mapEn = {};
  const mapAr = {};
  mappingArr.forEach(entry => {
    // USE THE NEW PROPERTY NAMES HERE
    if (entry.foreigncagetgory_en) {
      mapEn[entry.foreigncagetgory_en.trim().toLowerCase()] = entry.local_category_en || [];
    }
    if (entry.foreigncagetgory_ar) {
      mapAr[entry.foreigncagetgory_ar.trim().toLowerCase()] = entry.local_category_ar || [];
    }
  });
  return { mapEn, mapAr };
}

// Map array of foreign categories to local categories using the lookup map
function mapForeignToLocalCategories(foreignCategories, mapObj) {
  if (!Array.isArray(foreignCategories)) foreignCategories = [foreignCategories];
  const localSet = new Set();
  foreignCategories.forEach(cat => {
    if (!cat) return;
    const lookup = mapObj[cat.trim().toLowerCase()];
    if (Array.isArray(lookup)) {
      lookup.forEach(lc => localSet.add(lc));
    }
  });
  return Array.from(localSet);
}

function main() {
  const inputFile = 'output17.json';
  const mappingFile = 'categoriesMapped.json';
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const { mapEn, mapAr } = loadCategoryMaps(mappingFile);

  const output_en = [];
  const output_ar = [];

  products.forEach((product, idx) => {
    // const SKU = idx + 1;
    const SKU = idx + 1 + 5472;
    // Clean images array into comma-separated string, with direct URLs only
    let cleanImages = [];
    if (Array.isArray(product.images)) {
      cleanImages = product.images.map(extractDirectImage);
    }
    const imagesString = joinImages(cleanImages);

    // Map foreign categories to local categories
    const localCategoriesEn = mapForeignToLocalCategories(product.categories_en, mapEn);
    const localCategoriesAr = mapForeignToLocalCategories(product.categories_ar, mapAr);

    output_en.push({
      SKU: "en_" + SKU,
      Name: product.title_en || "",
      Description: product.description_en || "",
      "Short description": product.shortdescription_en || "",
      "Regular price": product.priceInfo?.originalPrice ? Number(product.priceInfo.originalPrice) : product.priceInfo?.price ? Number(product.priceInfo.price) : "",
      foreignCategories: joinCategories(product.categories_en),
      Categories: joinCategories(localCategoriesEn),
      Images: imagesString,
      Brands: product.brand_en || "",
    });

    output_ar.push({
      SKU: "ar_" + SKU,
      Name: product.title_ar || "",
      Description: product.description_ar || "",
      "Short description": product.shortdescription_ar || "",
      "Regular price": product.priceInfo?.originalPrice ? Number(product.priceInfo.originalPrice) : product.priceInfo?.price ? Number(product.priceInfo.price) : "",
      foreignCategories: joinCategories(product.categories_ar),
      Categories: joinCategories(localCategoriesAr),
      Images: imagesString,
      Brands: product.brand_ar || "",
    });
  });

  fs.writeFileSync('products16_en.json', JSON.stringify(output_en, null, 2), 'utf8');
  fs.writeFileSync('products16_ar.json', JSON.stringify(output_ar, null, 2), 'utf8');
  console.log('Done! Generated products2_en.json and products2_ar.json with local categories');
}

main();