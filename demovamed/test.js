// const puppeteer = require('puppeteer');
const fs = require('fs');

// (async () => {
//     const browser = await puppeteer.launch({
//         headless: false, // This will open the browser so you can see the action
//         args: ['--start-maximized'] // This will start the browser maximized
//     });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 }); // Set the viewport to full HD

//     // Read cookies from the JSON file
//     const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

//     // Set the cookies in the browser context
//     await page.setCookie(...cookies);

//     // Navigate to the target page
//     await page.goto('https://demovamed.com/');

//     // Add any additional actions here
//     // await browser.close(); // Uncomment this line if you want to close the browser after the actions
// })();

const all_products = JSON.parse(fs.readFileSync("allProducts.json", 'utf-8'));
const products_with_images = JSON.parse(fs.readFileSync("finalShapeProducts.json", 'utf-8'));

const productsWithNoImages = all_products.filter(product => {
    return !products_with_images.some(p => p.id === product.id);
});

fs.writeFileSync('productsWithNoImages.json', JSON.stringify(productsWithNoImages, null, 2));