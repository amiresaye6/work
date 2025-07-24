const fs = require('fs');

// Helper: Extract direct image URL, stripping params and decoding if from /_next/image
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

// Helper: Given an array of categories, join to a chain string
function arrayToCategoryChain(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.map(s => s.trim()).filter(Boolean).join(' > ');
}

// Helper: Given a category chain string, return the chain string format
// For example: "cat1 > cat2 > cat3" becomes "cat1, cat1 > cat2, cat1 > cat2 > cat3"
function categoryChainString(category) {
  if (!category || typeof category !== "string") return "";
  const parts = category.split('>').map(s => s.trim()).filter(s => s.length > 0);
  if (parts.length === 0) return "";
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parts.slice(0, i + 1).join(' > '));
  }
  return result.join(', ');
}

// Helper: Join images array as comma-separated string
function joinImages(images) {
  if (Array.isArray(images)) return images.join(', ');
  return typeof images === "string" ? images : "";
}

// Loads category mappings and returns lookup maps (EN & AR) for the correct mapping shape
function loadCategoryMaps(filepath) {
  const mappingArr = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const mapEn = {};
  const mapAr = {};
  mappingArr.forEach(entry => {
    // Mapping file keys and values should be chain strings!
    if (entry.foreignCategoryEn) {
      mapEn[entry.foreignCategoryEn.trim()] = entry.localCategoryEn || "";
    }
    if (entry.foreignCategoryAr) {
      mapAr[entry.foreignCategoryAr.trim()] = entry.localCategoryAr || "";
    }
  });
  return { mapEn, mapAr };
}

// Map foreign category chain to local category chain using lookup map
function mapForeignChainToLocal(foreignChain, mapObj) {
  if (!foreignChain) return "";
  return mapObj[foreignChain.trim()] || "";
}

// Read SKU counter from file or start from 1
function loadSkuCounter(skuFile) {
  try {
    const val = fs.readFileSync(skuFile, 'utf8');
    return Number(val.trim()) || 1;
  } catch (e) {
    return 1; // Default to 1 if file does not exist
  }
}

// Save next SKU counter to file
function saveSkuCounter(skuFile, counter) {
  fs.writeFileSync(skuFile, String(counter), 'utf8');
}

function main() {
  // Args: [node, script, inputFile, mappingFile, outputEn, outputAr, skuFile]
  const args = process.argv;
  if (args.length < 7) {
    console.error('Usage: node uploadFormatter.js input.json mapping.json output_en.json output_ar.json sku_counter.txt');
    process.exit(1);
  }
  const inputFile = args[2];
  const mappingFile = args[3];
  const outputEnFile = args[4];
  const outputArFile = args[5];
  const skuCounterFile = args[6];

  // Read main product array and category mapping
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const { mapEn, mapAr } = loadCategoryMaps(mappingFile);

  // Load SKU counter
  let skuCounter = loadSkuCounter(skuCounterFile);

  const output_en = [];
  const output_ar = [];

  products.forEach((product, idx) => {
    // Use and increment SKU counter
    const SKU = skuCounter;
    skuCounter++;

    // Clean images array into comma-separated string, with direct URLs only
    let cleanImages = [];
    if (Array.isArray(product.images)) {
      cleanImages = product.images.map(extractDirectImage);
    }
    const imagesString = joinImages(cleanImages);

    // --- CATEGORY LOGIC ---
    // 1. Build chain from arrays
    const foreignChainEn = arrayToCategoryChain(product.categories_en);
    const foreignChainAr = arrayToCategoryChain(product.categories_ar);

    // 2. Build chain string for output (chained format)
    const foreignChainStringEn = categoryChainString(foreignChainEn);
    const foreignChainStringAr = categoryChainString(foreignChainAr);

    // 3. Lookup local mapped chain by foreign chain
    const localChainEn = mapForeignChainToLocal(foreignChainEn, mapEn);
    const localChainAr = mapForeignChainToLocal(foreignChainAr, mapAr);

    // 4. Format local as chain string for output (chained format)
    const localChainStringEn = categoryChainString(localChainEn);
    const localChainStringAr = categoryChainString(localChainAr);

    // --- English ---
    output_en.push({
      SKU: "en_" + SKU,
      Name: product.new_title_en || "",
      Description: product.new_description_en || "",
      seo_keyword_en: product.seo_keyword_en || "",
      "Short description": product.short_description_en || "",
      "Regular price": product.priceInfo?.originalPrice
        ? Number(product.priceInfo.originalPrice)
        : product.priceInfo?.price
          ? Number(product.priceInfo.price)
          : "",
      foreignCategories: foreignChainStringEn,
      Categories: localChainStringEn,
      Images: imagesString,
      Brands: product.brand_en || "",
      isExpress: product.isExpress,
      "Attribute 1 name": "shipping",
      "Attribute 1 value(s)": product.isExpress ? "local" : "world",
    });

    // --- Arabic ---
    output_ar.push({
      SKU: "ar_" + SKU,
      Name: product.new_title_ar || "",
      Description: product.new_description_ar || "",
      seo_keyword_ar: product.seo_keyword_ar || "",
      "Short description": product.short_description_ar || "",
      "Regular price": product.priceInfo?.originalPrice
        ? Number(product.priceInfo.originalPrice)
        : product.priceInfo?.price
          ? Number(product.priceInfo.price)
          : "",
      foreignCategories: foreignChainStringAr,
      Categories: localChainStringAr,
      Images: imagesString,
      Brands: product.brand_ar || "",
      isExpress: product.isExpress,
      "Attribute 1 name": "طريقة الشحن",
      "Attribute 1 value(s)": product.isExpress ? "local" : "world",
    });
  });

  fs.writeFileSync(outputEnFile, JSON.stringify(output_en, null, 2), 'utf8');
  fs.writeFileSync(outputArFile, JSON.stringify(output_ar, null, 2), 'utf8');
  saveSkuCounter(skuCounterFile, skuCounter);

  console.log(`Done! Generated ${outputEnFile} and ${outputArFile} with local categories`);
  console.log(`Next SKU will start at: ${skuCounter}`);
}

main();