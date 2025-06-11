require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;

// Setup Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Main function to get enriched fields
async function getSeoFields(product) {
    // --- MOCK PROMPT, improve for production ---
    // You can enhance this prompt for more control over output!
    const prompt = `
Given this product information in Arabic and English, return SEO-optimized fields for BOTH Arabic and English:

- Rewrite the title (ar and en) to be more SEO-friendly.
- Rewrite the description (ar and en) to be more SEO-friendly and concise.
- Generate a short meta description (ar and en, 140 characters max) for search engines.

Output a JSON object matching this structure, and wrap it in a code block:

{
  "title_ar": "string",
  "title_en": "string",
  "description_ar": "string",
  "description_en": "string",
  "shortdescription_ar": "string",
  "shortdescription_en": "string"
}

Product Data:
Title (ar): ${product.title_ar}
Title (en): ${product.title_en}
Description (ar): ${product.description_ar}
Description (en): ${product.description_en}
Brand (ar): ${product.brand_ar}
Brand (en): ${product.brand_en}
Categories (ar): ${product.categories_ar ? product.categories_ar.join(' > ') : ''}
Categories (en): ${product.categories_en ? product.categories_en.join(' > ') : ''}

Respond ONLY with the JSON object wrapped in a code block.
    `.trim();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        const result = await model.generateContent(prompt);
        const text = await result.response.text();

        // Extract JSON from possible code blocks
        let jsonContent;
        const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (match && match[1]) {
            jsonContent = match[1].trim();
        } else {
            jsonContent = text.trim();
        }
        return JSON.parse(jsonContent);
    } catch (err) {
        console.error('Gemini error:', err);
        throw err;
    }
}

// Batch enrichment
async function enrichSeoBatch(inputFile, outputFile) {
    const raw = await fs.readFile(inputFile, 'utf-8');
    const products = JSON.parse(raw);

    const enriched = [];
    for (const product of products) {
        try {
            const seo = await getSeoFields(product);
            // Output object as original, but with overwritten/added fields
            enriched.push({
                ...product,
                title_ar: seo.title_ar,
                title_en: seo.title_en,
                description_ar: seo.description_ar,
                description_en: seo.description_en,
                shortdescription_ar: seo.shortdescription_ar,
                shortdescription_en: seo.shortdescription_en
            });
            console.log(`Enriched: ${product.productId || product.title_ar}`);
        } catch (err) {
            enriched.push({
                ...product,
                seo_error: err.message
            });
            console.error(`Failed: ${product.productId || product.title_ar}`);
        }
        // Optional: avoid Gemini rate-limits
        await new Promise(r => setTimeout(r, 1100));
    }

    await fs.writeFile(outputFile, JSON.stringify(enriched, null, 2), 'utf-8');
    console.log(`Done! Output -> ${outputFile}`);
}

// USAGE: node seo_enrich_gemini.js input.json output.json
const [,, inputFile, outputFile] = process.argv;
if (!inputFile || !outputFile) {
    console.error('Usage: node seo_enrich_gemini.js input.json output.json');
    process.exit(1);
}

enrichSeoBatch(inputFile, outputFile);