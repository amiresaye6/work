const scrapeUrls = require('./dataCollection');
const { processProducts } = require('./finalDataCollector');


// const start = 1;
// const end = 10;
const order = "?sortBy=prod_ar_products_price_default_asc"
const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/heart-circulation-health';
const url = baseUrl + order;
const outputPath = url.split(/nahdionline\.com\/(?:ar|en)\//)[1].split('?')[0].replace(/\//g, "_");
const outputFile = outputPath + 'Links.json';

// scrapeUrls.scrapeProducts(start, end, baseUrl, outputFile).then(() => {
scrapeUrls.scrapeProducts(baseUrl, "allProducts.json").then(() => {
    // processProducts(outputFile, outputPath);
    console.log('done');
});
