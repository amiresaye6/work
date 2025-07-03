const fs = require('fs');

function createCategoryMap(mapping, lang = 'ar') {
    const map = new Map();
    for (const entry of mapping) {
        if (lang === 'ar') {
            map.set(entry.foreign_category_ar, entry.local_category_ar);
        } else {
            map.set(entry.foreign_category_en, entry.local_category_en);
        }
    }
    return map;
}

function updateCategoriesFirstTwo(inputFile, mappingFile, outputFile, manualMapFile, lang = 'ar') {
    const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    const catMap = createCategoryMap(mapping, lang);

    const missingMappings = new Set();
    const manualMappingProducts = [];
    const updatedProducts = [];

    for (const product of products) {
        const foreignCats = (product.foreignCategories || '').split(',').map(c => c.trim()).filter(Boolean);
        const firstTwo = foreignCats.slice(0, 2);

        let mappedCategories = [];
        for (const cat of firstTwo) {
            if (catMap.has(cat)) {
                mappedCategories.push(...catMap.get(cat));
            } else if (cat) {
                missingMappings.add(cat);
            }
        }
        // Remove duplicates and join with comma+space
        mappedCategories = [...new Set(mappedCategories)];
        const result = {
            SKU: product.SKU,
            Categories: mappedCategories.join(', ')
        };

        // If no mapping found and result is empty, add to manual mapping file
        if (mappedCategories.length === 0) {
            manualMappingProducts.push(result);
        } else {
            updatedProducts.push(result);
        }
    }

    // Save updated products (SKU + Categories only)
    fs.writeFileSync(outputFile, JSON.stringify(updatedProducts, null, 2), 'utf8');

    // Save products needing manual mapping (SKU + Categories only)
    fs.writeFileSync(manualMapFile, JSON.stringify(manualMappingProducts, null, 2), 'utf8');

    // Optionally, log missing mappings for review
    if (missingMappings.size > 0) {
        fs.writeFileSync(
            `missing_mappings_${lang}.txt`,
            [...missingMappings].join('\n'),
            'utf8'
        );
    }
}

// Usage examples:
updateCategoriesFirstTwo(
    'combined_ar.json',
    'finalMapping.json',
    'test1_ar_updated.json',
    'ar_manual_mapping.json',
    'ar'
);
updateCategoriesFirstTwo(
    'combined_en.json',
    'finalMapping.json',
    'test1_en_updated.json',
    'en_manual_mapping.json',
    'en'
);