const fs = require('fs');
const stringSimilarity = require('string-similarity');

// Paths to your files
const firstFilePath = './allBrandsAr.json';
const secondFilePath = './arPharmacista_brand-analysis.json';
const outputFilePath = './fuzzyArMatchingBrands.json';

// Threshold for how similar the names must be (0.0 to 1.0)
const SIMILARITY_THRESHOLD = 0.8;

try {
    const firstFileData = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
    const secondFileData = JSON.parse(fs.readFileSync(secondFilePath, 'utf8'));

    const secondFileBrands = Object.keys(secondFileData.brandBreakdown);

    const matchingBrands = [];

    firstFileData.forEach(brandObj => {
        const brandName = brandObj.brand;

        const bestMatch = stringSimilarity.findBestMatch(brandName, secondFileBrands).bestMatch;

        if (bestMatch.rating >= SIMILARITY_THRESHOLD) {
            const matchedName = bestMatch.target;
            matchingBrands.push({
                firstFile: brandObj,
                secondFile: {
                    name: matchedName,
                    count: secondFileData.brandBreakdown[matchedName],
                    similarity: bestMatch.rating.toFixed(2)
                }
            });
        }
    });

    // Sort matches by product count descending
    matchingBrands.sort((a, b) => b.secondFile.count - a.secondFile.count);

    const outputData = {
        matchingBrandsCount: matchingBrands.length,
        matchingBrands
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));

    console.log(`Found ${matchingBrands.length} fuzzy-matching brands (≥ ${SIMILARITY_THRESHOLD})`);
    console.log(`Results saved to ${outputFilePath}`);
} catch (error) {
    console.error('Error processing files:', error.message);
}
