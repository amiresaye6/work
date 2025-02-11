const fs = require('fs').promises;
const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const categories = [
    {name: "صحة العظم", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1910684202"},
    {name: "فيتامين د", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1795333723"},
    {name: "كالسيوم", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1837060420"},
    {name: "مكملات غذائية للأطفال", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1917773735"},
    {name: "مكملات تخفيف الآلام", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=538257365"},
    {name: "كولاجين", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=966060722"},
    {name: "عناية بالشعر والأظافر و نضارة البشرة", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1578903720"},
    {name: "معززات الطاقة", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=921600817"},
    {name: "فيتامين ك - vitamin k", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=101080827"},
    {name: "جلوكوز امين للمفاصل", url: "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=1835006802"},
];

const main = async () => {
    let baseUrl = "https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value[]=820279660";
    const category_name = "Nutritional_supplements";
    let counter = 1;
    
    try {
        // Create or clear the file before starting the loop
        await fs.writeFile(`${category_name}.json`, '');
        
        while (baseUrl) {
            const response = await axios.get(baseUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'store-identifier': 888712498
                }
            });
            
            const data = response.data;
            for (const product of data.data) {
                await fs.appendFile(`${category_name}.json`, JSON.stringify(product, null, 2) + ',\n');
            }
            
            baseUrl = data.cursor.next ? data.cursor.next : null;
            console.log(`Getting product number ${counter++}, Url: ${baseUrl}`);
            const getRandomDelay = () => Math.floor(Math.random() * 2000);
            await delay(getRandomDelay());
        }
        
        console.log('All data has been written');
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
