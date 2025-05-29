const fs = require('fs');

// Helper to extract only the direct image URL, stripping all params and decoding if from /_next/image
function extractDirectImage(url) {
  if (typeof url !== "string") return url;
  // If it's a Nahdi proxy image, extract the real URL from the 'url' parameter
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
  // If already direct, just strip any params after extension
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

function main() {
  const inputFile = 'scraped_product_details.json';
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  const output_en = [];
  const output_ar = [];

  products.forEach((product, idx) => {
    const SKU = idx + 1;
    // Clean images array into comma-separated string, with direct URLs only
    let cleanImages = [];
    if (Array.isArray(product.images)) {
      cleanImages = product.images.map(extractDirectImage);
    }
    const imagesString = joinImages(cleanImages);

    output_en.push({
      SKU,
      Name: product.title_en || "",
      Description: product.description_en || "",
      "Sale price": product.priceInfo?.price ? Number(product.priceInfo.price) : "",
      "Regular price": product.priceInfo?.originalPrice ? Number(product.priceInfo.originalPrice) : "",
      Categories: joinCategories(product.categories_en),
      Images: imagesString,
      Brands: product.brand_en || "",
    });

    output_ar.push({
      SKU,
      Name: product.title_ar || "",
      Description: product.description_ar || "",
      "Sale price": product.priceInfo?.price ? Number(product.priceInfo.price) : "",
      "Regular price": product.priceInfo?.originalPrice ? Number(product.priceInfo.originalPrice) : "",
      Categories: joinCategories(product.categories_ar),
      Images: imagesString,
      Brands: product.brand_ar || "",
    });
  });

  fs.writeFileSync('products_en.json', JSON.stringify(output_en, null, 2), 'utf8');
  fs.writeFileSync('products_ar.json', JSON.stringify(output_ar, null, 2), 'utf8');
  console.log('Done! Generated products_en.json and products_ar.json');
}

main();