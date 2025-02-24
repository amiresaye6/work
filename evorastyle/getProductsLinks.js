

// const fs = require('fs');
// const cheerio = require('cheerio');

// // Load the HTML file
// const html = fs.readFileSync('حقائب_متنوعه.html', 'utf-8');
// const $ = cheerio.load(html);

// // Array to store the scraped data
// const products = [];

// // Iterate over each product card
// $('li.product').each((index, element) => {
//     const product = {};

//     // Extract product URL
//     product.url = $(element).find('a.card-link').attr('href') || '';
//     product.url = `https://www.evorastyle.com${product.url}`;

//     // Extract product name
//     product.name = $(element).find('.card-title').text().trim();

//     // Extract regular price before discount
//     product.regularPrice = $(element).find('.price__compare s').text().trim();

//     // Extract sale price
//     product.salePrice = $(element).find('.price-item--sale').text().trim();

//     // Extract image URL
//     product.imageUrl = $(element).find('img').attr('src') || '';
//     product.imageUrl = `https:${product.imageUrl}`;

//     // Extract product ID
//     product.productId = $(element).find('.product-item').data('product-id') || '';

//     // Extract variant ID
//     product.variantId = $(element).find('input[name="id"]').val() || '';

//     // Extract product description
//     product.description = $(element).find('.card-summary').text().trim();

//     // Push the product object to the array
//     products.push(product);
// });

// // Save the scraped data to a JSON file
// fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

// console.log('Scraping completed! Data saved to products.json');





// const fs = require('fs');
// const puppeteer = require('puppeteer');

// // File paths
// const inputFilePath = 'products.json'; // Input file with product URLs
// const outputFilePath = 'finalProducts.json'; // Output file for final product data
// const progressFilePath = 'progress.json'; // File to track progress

// // Load or initialize progress
// let progress = { index: 0 };
// if (fs.existsSync(progressFilePath)) {
//     progress = JSON.parse(fs.readFileSync(progressFilePath, 'utf-8'));
// }

// // Load product URLs
// const products = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

// // Initialize final products array
// let finalProducts = [];
// if (fs.existsSync(outputFilePath)) {
//     finalProducts = JSON.parse(fs.readFileSync(outputFilePath, 'utf-8'));
// }

// // Function to scrape product details using a single page instance
// async function scrapeProductDetails(page, url) {
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Extract product details
//     const product = await page.evaluate(() => {
//         // Product ID (adjust if needed)
//         const productId = document.querySelector('input[name="id"]')?.value;

//         // Product Name
//         const productName = document.querySelector('.productView-title span')?.innerText.trim();

//         // Product Category from breadcrumb (target the last span in .breadcrumb)
//         const productCategory = document.querySelector('.breadcrumb-container .breadcrumb span:last-child')?.innerText.trim();

//         // Product Description
//         const productDescription = document.querySelector('.toggle-content[product-description-tab]')?.innerText.trim();

//         // Original Price
//         const originalPrice = document.querySelector('.price__compare s.price-item--regular')?.innerText.trim();

//         // Discount Price
//         const discountPrice = document.querySelector('.price-item--sale')?.innerText.trim();

//         // Extract all product images, convert to Set to remove duplicates, then back to array
//         const imageElements = document.querySelectorAll('img');
//         const imagesSet = new Set();
//         imageElements.forEach(img => {
//             const src = img.src.replace('_800x', '_1024x'); // Higher resolution
//             imagesSet.add(src);
//         });
//         const images = Array.from(imagesSet);

//         return {
//             productId,
//             productUrl: window.location.href,
//             productName,
//             productCategory,
//             productDescription,
//             originalPrice,
//             discountPrice,
//             images,
//         };
//     });

//     return product;
// }

// // Main function to process products with a single browser
// async function processProducts() {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     for (let i = progress.index; i < products.length; i++) {
//         const product = products[i];
//         console.log(`Processing product ${i + 1}/${products.length}: ${product.url}`);

//         try {
//             const productDetails = await scrapeProductDetails(page, product.url);
//             finalProducts.push(productDetails);

//             // Save progress
//             progress.index = i + 1;
//             fs.writeFileSync(progressFilePath, JSON.stringify(progress, null, 2));

//             // Save final products
//             fs.writeFileSync(outputFilePath, JSON.stringify(finalProducts, null, 2));
//         } catch (error) {
//             console.error(`Error processing product ${product.url}:`, error);
//         }
//     }

//     await browser.close();
//     console.log('Scraping completed!');
// }

// // Start processing
// processProducts();


// const fs = require('fs');

// // File paths
// const inputFilePath = 'allData.json'; // Input file with all product data
// const outputFilePath = 'filteredProducts.json'; // Output file for filtered product data

// // Unwanted image URLs
// const unwantedImages = [
//     "https://www.evorastyle.com/cdn/shop/files/130x60_2cb6748d-fd64-486d-a9c2-7bc7bdd53d92.png?v=1710852150&width=300",
//     "https://www.evorastyle.com/cdn/shop/files/130x60whiteEvora_90x.png?v=1710852793",
//     "https://www.evorastyle.com/cdn/shop/files/130x60_2cb6748d-fd64-486d-a9c2-7bc7bdd53d92_65x.png?v=1710852150",
//     "https://www.evorastyle.com/cdn/shop/files/app-store_1_140x_crop_center.png?v=1710867056",
//     "https://www.evorastyle.com/cdn/shop/files/google_1_140x_crop_center.png?v=1710867076",
//     "https://www.evorastyle.com/cdn/shop/files/final_logo1_d0432c06-33d6-4916-9546-28e9512f60c3.png?v=1637416728&width=70",
//     "https://www.evorastyle.com/cdn/shop/files/7489f98883727cb9ee3ed563eddacaf7.jpg?v=1671431695&width=470",
//     "https://cdn.clare.ai/wati/images/WATI_logo_square_2.png",
//     "https://www.evorastyle.com/cdn/shop/files/74061939-31046034325619_95x.jpg?v=1726140540",
//     "https://www.evorastyle.com/cdn/shop/files/60798835-33609492725875_95x.jpg?v=1726140587",
//     "https://www.evorastyle.com/cdn/shop/files/67492723-33948979626099_95x.jpg?v=1713266596",
//     "https://cdn.shopify.com/s/files/1/0070/3666/5911/files/Vector.png?574",
//     // Add more unwanted URLs as needed
// ];

// // Load all products
// const allProducts = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

// // Function to filter unwanted images
// function filterImages(product) {
//     // Extract product identifier from productUrl (e.g., "22299763" from ".../products/22299763?variant=...")
//     const productIdMatch = product.productUrl.match(/products\/([^?]+)/);
//     const productIdentifier = productIdMatch ? productIdMatch[1] : '';

//     product.images = product.images.filter(image => {
//         // Skip empty strings (keep them as placeholders)
//         if (image === "") return true;

//         // Exclude unwanted images, those with '_medium', and those with '_1200x.'
//         if (unwantedImages.includes(image) || 
//             image.includes('_medium') || 
//             image.includes('_1200x.')) return false;

//         // Keep images with the product identifier OR those from /cdn/shop/files/ that aren't unwanted
//         return image.includes(productIdentifier) || 
//                (image.includes('/cdn/shop/files/') && !unwantedImages.some(unwanted => image.includes(unwanted.split('/').pop().split('?')[0])));
//     });
//     return product;
// }

// // Filter images for each product
// const filteredProducts = allProducts.map(filterImages);

// // Save the filtered products to a new JSON file
// fs.writeFileSync(outputFilePath, JSON.stringify(filteredProducts, null, 2));

// console.log('Image filtering completed! Data saved to filteredProducts.json');


const fs = require('fs');

// Load product data
const products = JSON.parse(fs.readFileSync('filteredProducts.json', 'utf-8'));

// Extract the variant ID from each product URL and update the product object
products.forEach(product => {
    const url = new URL(product.productUrl);
    const variantId = url.searchParams.get('variant');
    if (variantId) {
        product.productId = variantId;
    }
});

// Save the updated products to a new JSON file
fs.writeFileSync('updatedProducts.json', JSON.stringify(products, null, 2));

console.log('Variant IDs extracted from product URLs and saved to updatedProducts.json');