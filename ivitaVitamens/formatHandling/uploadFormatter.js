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

// Helper: Join categories array as comma-separated string
function joinCategories(categories) {
  if (Array.isArray(categories)) return categories.join(', ');
  return typeof categories === "string" ? categories : "";
}

// Helper: Join images array as comma-separated string
function joinImages(images) {
  if (Array.isArray(images)) return images.join(', ');
  return typeof images === "string" ? images : "";
}

// Loads category mappings and returns lookup maps (EN & AR)
function loadCategoryMaps(filepath) {
  const mappingArr = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const mapEn = {};
  const mapAr = {};
  mappingArr.forEach(entry => {
    if (entry.foreigncagetgory_en) {
      mapEn[entry.foreigncagetgory_en.trim().toLowerCase()] = entry.local_category_en || [];
    }
    if (entry.foreigncagetgory_ar) {
      mapAr[entry.foreigncagetgory_ar.trim().toLowerCase()] = entry.local_category_ar || [];
    }
  });
  return { mapEn, mapAr };
}

// Map foreign category array to local categories using lookup map
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
    console.error('Usage: node products_export_full_args.js input.json mapping.json output_en.json output_ar.json sku_counter.txt');
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

    // Map foreign categories to local categories
    const localCategoriesEn = mapForeignToLocalCategories(product.categories_en, mapEn);
    const localCategoriesAr = mapForeignToLocalCategories(product.categories_ar, mapAr);

    // --- English ---
    output_en.push({
      SKU: "en_" + SKU,
      Name: product.title_en || "",
      Description: product.description_en || "",
      "Short description": product.short_description_en || "",
      "Regular price": product.priceInfo?.originalPrice
        ? Number(product.priceInfo.originalPrice)
        : product.priceInfo?.price
          ? Number(product.priceInfo.price)
          : "",
      foreignCategories: joinCategories(product.categories_en),
      Categories: joinCategories(localCategoriesEn),
      Images: imagesString,
      Brands: product.brand_en || "",
      isExpress: product.isExpress,
      "Attribute 1 name": "shipping",
      "Attribute 1 value(s)": isExpress ? "local" : "world",
    });

    // --- Arabic ---
    output_ar.push({
      SKU: "ar_" + SKU,
      Name: product.title_ar || "",
      Description: product.description_ar || "",
      "Short description": product.short_description_ar || "",
      "Regular price": product.priceInfo?.originalPrice
        ? Number(product.priceInfo.originalPrice)
        : product.priceInfo?.price
          ? Number(product.priceInfo.price)
          : "",
      foreignCategories: joinCategories(product.categories_ar),
      Categories: joinCategories(localCategoriesAr),
      Images: imagesString,
      Brands: product.brand_ar || "",
      isExpress: product.isExpress,
      "Attribute 1 name": "طريقة الشحن",
      "Attribute 1 value(s)": isExpress ? "local" : "world",
    });
  });

  fs.writeFileSync(outputEnFile, JSON.stringify(output_en, null, 2), 'utf8');
  fs.writeFileSync(outputArFile, JSON.stringify(output_ar, null, 2), 'utf8');
  saveSkuCounter(skuCounterFile, skuCounter);

  console.log(`Done! Generated ${outputEnFile} and ${outputArFile} with local categories`);
  console.log(`Next SKU will start at: ${skuCounter}`);
}

main();