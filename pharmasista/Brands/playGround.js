{/*
    first script to combine the two fiels object of nahdi categories for further analysis
*/}

// const fs = require('fs');

// const firstFilePath = './allBrands.json'
// const secondFilePath = './allBrandsAr.json'
// const outputFilePath = './arEnBrands.json'

// // Read and parse the files
// try {
//     console.log("hi")
//     const firstFile  = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
//     const secondFile  = JSON.parse(fs.readFileSync(secondFilePath, 'utf8'));

//     let expressProducts = [];
//     // Extract brands from second file (object with brandBreakdown property)
//     firstFile.forEach(product => {
//         const secondProduct = secondFile.find( p => p.cacheId === product.cacheId & p.);
//         const newProduct = {
//             ar: product,
//             en: secondProduct
//         }
//         expressProducts.push(newProduct);
//     });

//     // Find matching brands

//     // Write the output to a file
//     fs.writeFileSync(outputFilePath, JSON.stringify(expressProducts, null, 2));


//     // console.log(`Results saved to ${outputFilePath}`);

// } catch (error) {
//     console.error('Error processing files:', error.message);
// }



{/*
    fuzzy search to find matches between two files brands
*/}

const fs = require('fs');
const stringSimilarity = require('string-similarity');

// Paths to your files
const nahdiEnBrandsPath = './allBrands.json'; // English brands from Nahdi
const nahdiArBrandsPath = './allBrandsAr.json'; // Arabic brands from Nahdi
const pharmacistaBrandsPath = './ar_en_pharmacista_brand-analysis.json'; // Pharmacista brands
const outputFilePath = './finalBrandsAnalysis.json';

// Threshold for how similar the names must be (0.0 to 1.0)
const SIMILARITY_THRESHOLD = 0.4;

try {
    // Parse the input files
    const nahdiEnBrands = JSON.parse(fs.readFileSync(nahdiEnBrandsPath, 'utf8'));
    const nahdiArBrands = JSON.parse(fs.readFileSync(nahdiArBrandsPath, 'utf8'));
    const pharmacistaBrands = JSON.parse(fs.readFileSync(pharmacistaBrandsPath, 'utf8'));

    // Extract brand names as arrays for similarity matching
    const nahdiEnBrandNames = nahdiEnBrands.map(brand => brand.brand);
    const nahdiArBrandNames = nahdiArBrands.map(brand => brand.brand);

    // Create maps for quick lookups
    const nahdiEnBrandMap = new Map(nahdiEnBrands.map(brand => [brand.brand, brand]));
    const nahdiArBrandMap = new Map(nahdiArBrands.map(brand => [brand.brand, brand]));

    // Final results array
    const finalResults = [];

    // Process each pharmacista brand
    pharmacistaBrands.brands.forEach(pharmacistaBrand => {
        // Step 1: Match Arabic names
        const arMatches = stringSimilarity.findBestMatch(
            pharmacistaBrand.ar,
            nahdiArBrandNames
        );
        const bestArMatch = arMatches.bestMatch;

        // Step 2: Match English names
        const enMatches = stringSimilarity.findBestMatch(
            pharmacistaBrand.en,
            nahdiEnBrandNames
        );
        const bestEnMatch = enMatches.bestMatch;

        // Step 3: Create result object
        const resultObj = {
            // Pharmacista brand info
            pharmacistaBrandArabic: pharmacistaBrand.ar,
            pharmacistaBrandEnglish: pharmacistaBrand.en,
            pharmacistaCount: pharmacistaBrand.count,

            // Arabic match info
            nahdiBrandArabic: bestArMatch.rating >= SIMILARITY_THRESHOLD ? bestArMatch.target : null,
            nahdiBrandArabicSimilarity: +bestArMatch.rating.toFixed(2),
            nahdiArProductCount: bestArMatch.rating >= SIMILARITY_THRESHOLD ?
                nahdiArBrandMap.get(bestArMatch.target).productCount : null,

            // English match info
            nahdiBrandEnglish: bestEnMatch.rating >= SIMILARITY_THRESHOLD ? bestEnMatch.target : null,
            nahdiBrandEnglishSimilarity: +bestEnMatch.rating.toFixed(2),
            nahdiEnProductCount: bestEnMatch.rating >= SIMILARITY_THRESHOLD ?
                nahdiEnBrandMap.get(bestEnMatch.target).productCount : null
        };

        // Calculate overall best similarity score
        resultObj.similarityScore = Math.max(
            resultObj.nahdiBrandArabicSimilarity || 0,
            resultObj.nahdiBrandEnglishSimilarity || 0
        );

        // Add to results if at least one match meets the threshold
        if (resultObj.similarityScore >= SIMILARITY_THRESHOLD) {
            finalResults.push(resultObj);
        }
    });

    // Sort results by similarity score (descending)
    finalResults.sort((a, b) => b.similarityScore - a.similarityScore);

    // Clean up the final results while preserving both similarity scores
    const cleanResults = finalResults.map(result => ({
        similarityScore: result.similarityScore,
        arabicSimilarityScore: result.nahdiBrandArabicSimilarity,
        englishSimilarityScore: result.nahdiBrandEnglishSimilarity,
        pharmacistaBrandArabic: result.pharmacistaBrandArabic,
        pharmacistaBrandEnglish: result.pharmacistaBrandEnglish,
        pharmacistaCount: result.pharmacistaCount,
        nahdiBrandArabic: result.nahdiBrandArabic,
        nahdiBrandEnglish: result.nahdiBrandEnglish,
        nahdiProductCount: Math.max(
            result.nahdiArProductCount || 0,
            result.nahdiEnProductCount || 0
        ) || null,
        correctMatch: result.similarityScore >= 0.8 ? true : null
    }));

    // Write the results to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(cleanResults, null, 2));

    console.log(`Processed ${pharmacistaBrands.brands.length} Pharmacista brands`);
    console.log(`Found ${cleanResults.length} matches with similarity ≥ ${SIMILARITY_THRESHOLD}`);
    console.log(`Results saved to ${outputFilePath}`);
} catch (error) {
    console.error('Error processing files:', error.message);
}