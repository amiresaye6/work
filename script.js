// const scrapeUrls = require('./dataCollection');
const { processProducts } = require('./finalDataCollector');


// // const start = 1;
// // const end = 10;
// const order = "?sortBy=prod_ar_products_price_default_asc"
// const baseUrl = 'https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/heart-circulation-health';
// const url = baseUrl + order;
// const outputPath = url.split(/nahdionline\.com\/(?:ar|en)\//)[1].split('?')[0].replace(/\//g, "_");
// const outputFile = outputPath + 'Links.json';

// // scrapeUrls.scrapeProducts(start, end, baseUrl, outputFile).then(() => {
// scrapeUrls.scrapeProducts(baseUrl, "allProducts.json").then(() => {
//     // processProducts(outputFile, outputPath);
//     console.log('done');
// });


// const fs = require('fs');
// const path = require('path');

// // Path to your JSON file
// const jsonFilePath = path.join(__dirname, 'ar_en_allCategories.json'); // Adjust the path to your JSON file

// // Read the JSON file
// const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
// const data = JSON.parse(jsonData);

// // Output file where the scraped data will be saved
// const outputFile = path.join(__dirname, 'output.json'); // Adjust the output file path as needed

// // Function to run the scraper for each object in the JSON file
// const runScrapers = async () => {
//     for (const item of data) {
//         console.log(`Starting scrape for URL: ${item.url}`);
//         await scrapeUrls.scrapeProducts(item.url, outputFile, item.ivitaCategoryAr, item.ivitaCategoryEn, item.elnahdyCategoryAr, item.elnahdyCategoryEn);
//         console.log(`Finished scrape for URL: ${item.url}`);
//     }
// };

// // Run the scrapers
// runScrapers().then(() => {
//     console.log('All scrapes completed.');
// }).catch((error) => {
//     console.error('Error during scraping:', error);
// });

processProducts('test.json', 5)
    .then(() => {
        console.log('All products processed successfully.');
    })
    .catch((error) => {
        console.error('Error processing products:', error);
    });