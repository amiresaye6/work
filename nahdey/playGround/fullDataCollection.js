const {scrapeProducts} = require('../dataCollection');
const { processProducts } = require('./productsColletion');


const wrapper = async () => {
    const start = 1; // starting page number
    const end = 5; // ending page number to scrape
    const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/women-s-health?sortBy=prod_ar_products_price_default_asc';
    // json file name is the category_subcategory.json  e.g. vitamins_supplements.json
    const outputFile = baseUrl.split('ar/')[1].split('?')[0].replace(/\//g, '_') + '.json';

    await scrapeProducts(start, end, baseUrl, outputFile);

    await processProducts(outputFile, end, outputFile);
}
wrapper();