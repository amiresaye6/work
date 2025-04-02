const fs = require('fs').promises;
const stringSimilarity = require('string-similarity');
const xlsx = require('xlsx');

async function mergeDiscountsAndConvertToExcel(ivitaFilePath, sadaFilePath, matchedOutputFilePath, allOutputFilePath, excelOutputFilePath) {
    try {
        // Configuration variables
        const CONFIG = {
            SIMILARITY_THRESHOLD: 0.65,          // Minimum similarity for name matching (0-1)
            MAX_PRICE_DIFFERENCE_PERCENT: 50,   // Maximum allowed price difference percentage (null to disable)
            NAME_SEPARATOR: '-\r',             // Separator between Arabic and English names in Ivita
            IVITA_PRICE_FIELD: 'Regular price(A)', // Field name for Ivita price
            SADA_PRICE_FIELD: 'PRICE',         // Field name for Sada price
            SADA_ARABIC_FIELD: 'ARABIC NAME'   // Field name for Sada Arabic name
        };

        // Read both JSON files
        const ivitaData = JSON.parse(await fs.readFile(ivitaFilePath, 'utf-8'));
        const sadaData = JSON.parse(await fs.readFile(sadaFilePath, 'utf-8'));

        // Counter for matches
        let matchCount = 0;

        // Prepare Sada data with Arabic names and prices
        const sadaProducts = sadaData.map(item => ({
            arabicName: item[CONFIG.SADA_ARABIC_FIELD]?.trim(),
            price: Number(item[CONFIG.SADA_PRICE_FIELD]) || null,
            discount: item.Discount,
            originalData: item
        })).filter(item => item.arabicName);

        // Arrays for matched and all products
        const matchedProducts = [];
        const allProducts = [];

        // Process ivita products
        for (const ivitaItem of ivitaData) {
            const fullName = ivitaItem['Name(A)']?.trim() || '';
            const nameParts = fullName.split(CONFIG.NAME_SEPARATOR);
            const arabicName = nameParts[0]?.trim();
            const ivitaPrice = Number(ivitaItem[CONFIG.IVITA_PRICE_FIELD]) || null;

            if (!arabicName) {
                allProducts.push({
                    ...ivitaItem,
                    "Sada Discount": null,
                    "Match Confidence": null,
                    "Price Difference %": null
                });
                continue;
            }

            // Find best match for Arabic name
            const sadaArabicNames = sadaProducts.map(p => p.arabicName || '');
            const arabicMatch = stringSimilarity.findBestMatch(arabicName, sadaArabicNames);

            if (arabicMatch.bestMatch.rating >= CONFIG.SIMILARITY_THRESHOLD) {
                const matchedProduct = sadaProducts[arabicMatch.bestMatchIndex];
                
                // Calculate price difference percentage
                let priceDifferencePercent = null;
                if (ivitaPrice && matchedProduct.price) {
                    priceDifferencePercent = Number(((ivitaPrice - matchedProduct.price) / ivitaPrice * 100).toFixed(2));
                }

                const isPriceAcceptable = CONFIG.MAX_PRICE_DIFFERENCE_PERCENT === null || 
                    (priceDifferencePercent !== null && Math.abs(priceDifferencePercent) <= CONFIG.MAX_PRICE_DIFFERENCE_PERCENT);

                if (isPriceAcceptable) {
                    matchCount++;
                    const matchedObject = {
                        "Ivita Name": fullName,
                        "Sada Arabic Name": matchedProduct.arabicName,
                        "Sada Discount": matchedProduct.discount,
                        "Match Confidence": arabicMatch.bestMatch.rating,
                        "Ivita Price": ivitaPrice,
                        "Sada Price": matchedProduct.price,
                        "Price Difference %": priceDifferencePercent,
                        "Ivita Data": ivitaItem,
                        "Sada Data": matchedProduct.originalData
                    };
                    matchedProducts.push(matchedObject);

                    allProducts.push({
                        ...ivitaItem,
                        "Sada Discount": matchedProduct.discount,
                        "Match Confidence": arabicMatch.bestMatch.rating,
                        "Price Difference %": priceDifferencePercent
                    });
                } else {
                    allProducts.push({
                        ...ivitaItem,
                        "Sada Discount": null,
                        "Match Confidence": arabicMatch.bestMatch.rating,
                        "Price Difference %": priceDifferencePercent
                    });
                }
            } else {
                allProducts.push({
                    ...ivitaItem,
                    "Sada Discount": null,
                    "Match Confidence": arabicMatch.bestMatch.rating,
                    "Price Difference %": null
                });
            }
        }

        // Write matched products to JSON file
        await fs.writeFile(
            matchedOutputFilePath,
            JSON.stringify(matchedProducts, null, 2),
            'utf-8'
        );

        // Write all products to JSON file
        await fs.writeFile(
            allOutputFilePath,
            JSON.stringify(allProducts, null, 2),
            'utf-8'
        );

        // Convert allProducts back to Excel format
        const worksheet = xlsx.utils.json_to_sheet(allProducts, {
            header: Object.keys(ivitaData[0]).concat(["Sada Discount", "Match Confidence", "Price Difference %"]),
            skipHeader: false
        });
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        xlsx.writeFile(workbook, excelOutputFilePath);

        // Print statistics
        console.log('Matching Statistics:');
        console.log(`Total ivita products: ${ivitaData.length}`);
        console.log(`Total sada products: ${sadaData.length}`);
        console.log(`Number of matches found: ${matchCount}`);
        console.log(`Percentage of matches: ${((matchCount / ivitaData.length) * 100).toFixed(2)}%`);
        console.log(`Matched products saved to: ${matchedOutputFilePath}`);
        console.log(`All products saved to: ${allOutputFilePath}`);
        console.log(`Excel output saved to: ${excelOutputFilePath}`);

        return { matchedProducts, allProducts };

    } catch (error) {
        console.error('Error processing files:', error.message);
        throw error;
    }
}

// Execute the script
(async () => {
    const ivitaFilePath = './ivitaProducts.json';
    const sadaFilePath = './sadaDiscounts.json';
    const matchedOutputFilePath = './matchedProducts.json';
    const allOutputFilePath = './ivitaProductsWithSadaDiscounts.json';
    const excelOutputFilePath = './ivitaProductsWithSadaDiscounts.xlsx';

    try {
        await mergeDiscountsAndConvertToExcel(
            ivitaFilePath,
            sadaFilePath,
            matchedOutputFilePath,
            allOutputFilePath,
            excelOutputFilePath
        );
    } catch (error) {
        console.error('Merge operation failed:', error.message);
    }
})();