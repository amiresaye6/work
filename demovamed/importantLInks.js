const fs = require('fs').promises;
const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
807039089
const categories = [
    {name: "allProductsEn", url: "https://api.salla.dev/store/v1/products"}
]
// https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=831122486


const main = async () => {
    let counter = 1;

    try {
        for (const category of categories) {
            const category_name = category.name.replace(/ /g, "_"); // Replace spaces with underscores
            const products = []; // Array to store all products for this category
            let baseUrl = category.url;

            // Clear the file before starting
            await fs.writeFile(`${category_name}.json`, '');
            
            while (baseUrl) {
                console.log(`Getting product number ${counter++}, Url: ${baseUrl}`);
                const response = await axios.get(baseUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'store-identifier': 1448334334,
                        'accept-language': 'en'
                    }
                });

                const data = response.data;
                products.push(...data.data); // Add products to the array

                baseUrl = data.cursor.next ? data.cursor.next : null;

                // Add a random delay between requests
                const getRandomDelay = () => Math.floor(Math.random() * 1000);
                await delay(getRandomDelay());
            }

            // Write all products to the file as a JSON array
            await fs.writeFile(`${category_name}.json`, JSON.stringify(products, null, 2));
            console.log(`All data for ${category.name} has been written to ${category_name}.json`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

main();