const fs = require("fs");


const ivitaData = fs.readFileSync("ivitaProducts.json", "utf8")
const newData = fs.readFileSync("allProducts.json", "utf8")

newData.forEach(newProducts => {
    ivitaData.forEach(ivitaProduct => {
        if (newProducts.Name === itaProduct.name) {

        }
    });
});
