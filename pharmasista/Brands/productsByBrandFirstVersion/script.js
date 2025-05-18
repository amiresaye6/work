// first script to combine the two files object of nahdi categories for further analysis

// const fs = require('fs');

// const firstFilePath = './pharmacista.json'
// // Remove unused variable
// const outputFilePath = './test.json'

// // Read and parse the files
// try {
//     console.log("hi")
//     const firstFile = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));

//     // Filter products by brand
//     const expressProducts = firstFile.filter(product => 
//         product.Brand === "L'oreal" || product["براند"] === "لوريال"
//     );
//     // Write the output to a file
//     fs.writeFileSync(outputFilePath, JSON.stringify(expressProducts, null, 2));


//     // console.log(`Results saved to ${outputFilePath}`);

// } catch (error) {
//     console.error('Error processing files:', error.message);
// }

/**
 * Find matching products with increased importance on price matching
 */
// function findMatchingProducts(array1, array2, options = {}) {
//   const {
//     nameSimilarityThreshold = 0.6,  // Lowered from 0.7
//     priceTolerancePercent = 10,     
//     maxPriceDifference = 15,        
//     requireNumberMatch = true,
//     priceWeight = 0.6,              // Increased from 0.3 to 0.6
//     nameWeight = 0.4                // Decreased from 0.7 to 0.4
//   } = options;
  
//   // Helper functions remain the same
//   function normalizeArabicText(text) {
//     // Same implementation as before
//     if (!text) return '';
//     text = String(text);
//     return text
//       .replace(/[\u064B-\u065F\u0670]/g, '')
//       .replace(/[\u0622\u0623\u0625]/g, 'ا')
//       .replace(/[\u064A\u0649]/g, 'ي')
//       .replace(/[\u0629]/g, 'ه')
//       .replace(/[\u0640]/g, '')
//       .replace(/\s+/g, ' ')
//       .trim()
//       .toLowerCase();
//   }
  
//   function extractProductDetails(text) {
//     // Same implementation as before
//     if (!text) return {
//       volumes: [],
//       colors: [],
//       types: [],
//       numbers: [],
//       allNumbers: [],
//       full: ''
//     };
    
//     const originalText = String(text);
    
//     const volumeRegex = /(\d+(?:\.\d+)?)\s*(?:مل|جم|جرام|ml|g|gr|oz)/gi;
//     const volumeMatches = originalText.match(volumeRegex) || [];
    
//     const allNumberMatches = originalText.match(/\d+(?:\.\d+)?/g) || [];
    
//     const volumeNumbers = volumeMatches.map(vol => {
//       const match = vol.match(/\d+(?:\.\d+)?/);
//       return match ? match[0] : null;
//     }).filter(Boolean);
    
//     const numberMatches = allNumberMatches.filter(num => !volumeNumbers.includes(num));
    
//     const colorRegex = /(?:بني|اسود|احمر|ازرق|اصفر|ابيض|وردي|برتقالي|اخضر|بنفسجي|ذهبي|فضي|رمادي|داكن|فاتح)/gi;
//     const colorMatches = originalText.match(colorRegex) || [];
    
//     const typeRegex = /(?:كريم|صبغة|شامبو|بلسم|مسك|مثبت|سيروم|زيت|جل|لوشن|ماسك)/gi;
//     const typeMatches = originalText.match(typeRegex) || [];
    
//     const normalizedVolumes = volumeMatches.map(vol => {
//       const numMatch = vol.match(/\d+(?:\.\d+)?/);
//       if (!numMatch) return null;
      
//       const num = numMatch[0];
      
//       const unitMatch = vol.match(/[a-zA-Zء-ي]+/gi);
//       const unit = unitMatch ? unitMatch[0].toLowerCase() : '';
      
//       return `${num}${unit}`;
//     }).filter(Boolean);
    
//     const bottleSizeRegex = /(\d+(?:\.\d+)?)\s*(?:بوتل|زجاجة|عبوة)/gi;
//     const bottleSizeMatches = originalText.match(bottleSizeRegex) || [];
    
//     bottleSizeMatches.forEach(match => {
//       const numMatch = match.match(/\d+(?:\.\d+)?/);
//       if (numMatch) {
//         normalizedVolumes.push(`${numMatch[0]}bottle`);
//       }
//     });
    
//     return {
//       volumes: normalizedVolumes,
//       colors: colorMatches,
//       types: typeMatches,
//       numbers: numberMatches,
//       allNumbers: [...volumeNumbers, ...numberMatches],
//       full: originalText
//     };
//   }
  
//   function doNumbersMatch(details1, details2) {
//     // Same implementation as before
//     if (!requireNumberMatch) return true;
    
//     if (details1.allNumbers.length === 0 && details2.allNumbers.length === 0) {
//       return true;
//     }
    
//     if (details1.allNumbers.length === 0 || details2.allNumbers.length === 0) {
//       return false;
//     }
    
//     if (details1.volumes.length > 0 && details2.volumes.length > 0) {
//       const hasMatchingVolume = details1.volumes.some(vol1 => 
//         details2.volumes.some(vol2 => vol1.toLowerCase() === vol2.toLowerCase())
//       );
      
//       if (hasMatchingVolume) {
//         return true;
//       }
//     }
    
//     if (details1.numbers.length > 0 && details2.numbers.length > 0) {
//       const hasMatchingNumber = details1.numbers.some(num1 => 
//         details2.numbers.some(num2 => num1 === num2)
//       );
      
//       if (hasMatchingNumber) {
//         return true;
//       }
//     }
    
//     return false;
//   }
  
// function calculateTextSimilarity(text1, text2) {
//   // Original texts for extracting product details
//   const originalText1 = String(text1 || '');
//   const originalText2 = String(text2 || '');
  
//   // Clean texts for text comparison
//   const cleanText1 = normalizeArabicText(originalText1);
//   const cleanText2 = normalizeArabicText(originalText2);
  
//   // Extract product attributes from original text to preserve numbers
//   const details1 = extractProductDetails(originalText1);
//   const details2 = extractProductDetails(originalText2);
  
//   // Check if numeric identifiers match
//   const numbersMatch = doNumbersMatch(details1, details2);
  
//   // Calculate Jaccard similarity for each attribute type
//   function jaccardSimilarity(arr1, arr2) {
//     if (!arr1.length && !arr2.length) return 1;
//     if (!arr1.length || !arr2.length) return 0;
    
//     const set1 = new Set(arr1.map(s => String(s).toLowerCase()));
//     const set2 = new Set(arr2.map(s => String(s).toLowerCase()));
    
//     const intersection = [...set1].filter(item => set2.has(item));
//     const union = new Set([...set1, ...set2]);
    
//     return intersection.length / union.size;
//   }
  
//   // Levenshtein distance for full text similarity
//   function levenshteinDistance(s1, s2) {
//     if (s1.length === 0) return s2.length;
//     if (s2.length === 0) return s1.length;
    
//     const matrix = Array(s1.length + 1).fill().map(() => Array(s2.length + 1).fill(0));
    
//     for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
//     for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
    
//     for (let i = 1; i <= s1.length; i++) {
//       for (let j = 1; j <= s2.length; j++) {
//         const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
//         matrix[i][j] = Math.min(
//           matrix[i - 1][j] + 1,        // deletion
//           matrix[i][j - 1] + 1,        // insertion
//           matrix[i - 1][j - 1] + cost  // substitution
//         );
//       }
//     }
    
//     return 1 - (matrix[s1.length][s2.length] / Math.max(s1.length, s2.length));
//   }
  
//   // Calculate component scores
//   const volumeScore = jaccardSimilarity(details1.volumes, details2.volumes);
//   const colorScore = jaccardSimilarity(details1.colors, details2.colors);
//   const typeScore = jaccardSimilarity(details1.types, details2.types);
//   const numberScore = jaccardSimilarity(details1.numbers, details2.numbers);
//   const textScore = levenshteinDistance(cleanText1, cleanText2);
  
//   // Weighted score calculation - THIS WAS MISSING
//   const score = (
//     (volumeScore * 0.25) + 
//     (colorScore * 0.2) + 
//     (typeScore * 0.2) + 
//     (numberScore * 0.15) + 
//     (textScore * 0.2)
//   );
  
//   return {
//     score: numbersMatch ? score : 0, // Now score is defined
//     numbersMatch,
//     details: {
//       volumeScore,
//       colorScore,
//       typeScore,
//       numberScore,
//       textScore,
//       normalizedText1: cleanText1,
//       normalizedText2: cleanText2,
//       extractedVolumes1: details1.volumes,
//       extractedVolumes2: details2.volumes,
//       extractedNumbers1: details1.numbers,
//       extractedNumbers2: details2.numbers
//     }
//   };
// }
  
//   // Modified price matching function with tiers for more granular control
//   function normalizePrice(priceValue) {
//     if (typeof priceValue === 'number') return priceValue;
    
//     const priceString = String(priceValue);
//     const numericValue = priceString.replace(/[^\d.]/g, '');
//     return parseFloat(numericValue) || 0;
//   }
  
//   function isPriceMatch(price1, price2) {
//     const normalizedPrice1 = normalizePrice(price1);
//     const normalizedPrice2 = normalizePrice(price2);
    
//     if (normalizedPrice1 === 0 || normalizedPrice2 === 0) {
//       return { isMatch: true, confidence: 0, tier: 'unknown' };
//     }
    
//     const priceDiff = Math.abs(normalizedPrice1 - normalizedPrice2);
//     const avgPrice = (normalizedPrice1 + normalizedPrice2) / 2;
//     const percentDiff = (priceDiff / avgPrice) * 100;
    
//     // Enhanced tiered pricing system
//     let tier, confidence;
    
//     if (percentDiff <= 3) {
//       // Nearly identical prices
//       tier = 'exact';
//       confidence = 1.0;
//     } else if (percentDiff <= 8) {
//       // Very close prices
//       tier = 'very-close';
//       confidence = 0.9;
//     } else if (percentDiff <= priceTolerancePercent) {
//       // Close prices
//       tier = 'close';
//       confidence = 0.8;
//     } else if (percentDiff <= 20) {
//       // Somewhat different prices
//       tier = 'somewhat-different';
//       confidence = 0.5;
//     } else {
//       // Very different prices
//       tier = 'different';
//       confidence = 0.2;
//     }
    
//     // Check absolute difference as well
//     const isWithinAbsolute = priceDiff <= maxPriceDifference;
    
//     return {
//       isMatch: percentDiff <= priceTolerancePercent || isWithinAbsolute,
//       confidence,
//       tier,
//       percentDiff,
//       absoluteDiff: priceDiff,
//       prices: {
//         price1: normalizedPrice1,
//         price2: normalizedPrice2
//       }
//     };
//   }
  
//   // Main matching algorithm with price-focused changes
//   const matches = [];
  
//   array1.forEach(product1 => {
//     const productName1 = product1.Name || '';
//     const productPrice1 = product1['Sales Price'] || 0;
    
//     const productMatches = [];
    
//     array2.forEach(product2 => {
//       const productName2 = product2.title || '';
//       const productPrice2 = normalizePrice(product2.price || 0);
      
//       // First check price match - give it more importance by checking it first
//       const priceMatch = isPriceMatch(productPrice1, productPrice2);
      
//       // If prices are very different, we might want to skip 
//       // unless the name similarity is exceptionally high
//       if (priceMatch.tier === 'different' && priceMatch.percentDiff > 30) {
//         // Only consider this match if name similarity is over 85%
//         const quickNameCheck = calculateTextSimilarity(productName1, productName2);
//         if (quickNameCheck.score < 0.85) {
//           return; // Skip this product pair - prices too different
//         }
//       }
      
//       // Now do full name similarity calculation
//       const { score: nameSimilarity, numbersMatch, details: nameDetails } = calculateTextSimilarity(
//         productName1, 
//         productName2
//       );
      
//       // If numbers don't match and we require number matching, skip
//       if (requireNumberMatch && !numbersMatch) {
//         return;
//       }
      
//       // Calculate overall score with price-focused weights
//       const overallScore = nameSimilarity * nameWeight + priceMatch.confidence * priceWeight;
      
//       // Adjust name similarity threshold based on price match quality
//       let adjustedThreshold = nameSimilarityThreshold;
      
//       if (priceMatch.tier === 'exact') {
//         // If prices match almost exactly, we can accept a lower name similarity
//         adjustedThreshold = nameSimilarityThreshold - 0.2;
//       } else if (priceMatch.tier === 'very-close') {
//         // If prices are very close, slightly lower the name threshold
//         adjustedThreshold = nameSimilarityThreshold - 0.1;
//       }
      
//       if (nameSimilarity >= adjustedThreshold || 
//           overallScore >= 0.7) { // Overall score threshold
//         productMatches.push({
//           product1,
//           product2,
//           nameSimilarity,
//           nameDetails,
//           priceMatch,
//           overallScore,
//           numbersMatch
//         });
//       }
//     });
    
//     // Sort product matches by overall score
//     if (productMatches.length > 0) {
//       // Pick the best match
//       const bestMatch = productMatches.sort((a, b) => b.overallScore - a.overallScore)[0];
//       matches.push(bestMatch);
//     }
//   });
  
//   return matches.sort((a, b) => b.overallScore - a.overallScore);
// }


// const fs = require('fs');
// // 
// // Load the JSON files
// const array1 = JSON.parse(fs.readFileSync('lorialTestPharmasista.json', 'utf8'));
// const array2 = JSON.parse(fs.readFileSync('lorialTestNahey.json', 'utf8'));
// // 
// // Find matches with increased price importance
// const matches = findMatchingProducts(array1, array2, {
//   nameSimilarityThreshold: 0.5,    // Lower the name threshold
//   priceTolerancePercent: 12,       // Slightly increase price tolerance
//   maxPriceDifference: 18,
//   requireNumberMatch: true,        // Still require matching numbers
//   priceWeight: 0.55,               // Give higher weight to price (was 0.3)
//   nameWeight: 0.45                 // Give lower weight to name (was 0.7)
// });
// // 
// // Write the results
// fs.writeFileSync('hi.json', JSON.stringify(matches, null, 2));














// 
// first script to combine the two files object of nahdi categories for further analysis
// 
const fs = require('fs');
// 
const firstFilePath = './finalBrandsAnalysis_2025-05-15_18-37-27_2025-05-18_15-39-08.json'
// Remove unused variable
const outputFilePath = './test.json'
// 
// Read and parse the files
try {
    console.log("hi")
    const firstFile = JSON.parse(fs.readFileSync(firstFilePath, 'utf8'));
// 
    // Filter products by brand
    const expressProducts = firstFile.filter(brand => 
        brand.correctMatch
    );
    // Write the output to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(expressProducts, null, 2));
// 
// 
    // console.log(`Results saved to ${outputFilePath}`);
// 
} catch (error) {
    console.error('Error processing files:', error.message);
}