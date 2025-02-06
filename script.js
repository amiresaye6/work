const scrapeUrls = require('./dataCollection');
const { processProducts } = require('./finalDataCollector');


const start = 1;
const end = 15;
const order = "?sortBy=prod_ar_products_price_default_asc"
// const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/sensior-s-essentials?sortBy=prod_ar_products_price_default_asc';
// const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/sensior-s-essentials';
// const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/mens-health' + order;
const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/children-s-health' + order;
const outputPath = baseUrl.split(/nahdionline\.com\/(?:ar|en)\//)[1].split('?')[0].replace(/\//g, "_");
const outputFile = outputPath + 'Links.json';

scrapeUrls.scrapeProducts(start, end, baseUrl, outputFile).then(() => {
    processProducts(outputFile, outputPath);
    console.log('done');
});
