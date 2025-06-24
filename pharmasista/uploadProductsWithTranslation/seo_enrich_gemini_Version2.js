require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;

let counter = 0

// Setup Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Main function to get enriched fields using both Arabic and English data in one prompt
async function getSeoFields(product) {
    const prompt = `
You are a professional SEO product copywriter tasked with rewriting product descriptions for our website. Every response must adhere to these instructions for consistency, SEO optimization, and market relevance:

* Mention the product name exactly three times in each language:
  * First, at the very start of the description.
  * Second, in a section titled: 🔹 إرشادات استخدام [اسم المنتج] (Usage Instructions for [Product Name]) (for Arabic) or 🔹 Usage Instructions for [Product Name] (for English).
  * Third, in a section titled: 🔹 مكونات [اسم المنتج] (Ingredients of [Product Name]) (for Arabic) or 🔹 Ingredients of [Product Name] (for English).
* Bold the product name wherever it appears.
* Use star bullets (⭐) to list product features, benefits, usage instructions, or ingredients.
* At the end of each language block, include 10 relevant, popular hashtags optimized for the Saudi market.
* Output a single, clean, well-formatted text block per language, suitable for direct website publishing.
* Do not include explanations, notes, code blocks, or commentary—only the SEO-optimized description.
* Output the Arabic block first, then the English block.

Below is the current product data in both Arabic and English. Your job is to rewrite the titles, descriptions, and generate a short description (max 140 characters) for SEO in both languages, keeping the object structure the same and adding two new fields: shortdescription_ar and shortdescription_en.

Respond ONLY with a valid JSON object, matching this structure:
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
    `.trim();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

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

// Stream enrichment: write each enriched product as soon as it's ready
async function enrichSeoStream(inputFile, outputFile, failedFile) {
    const raw = await fs.readFile(inputFile, 'utf-8');
    const products = JSON.parse(raw);

    // Prepare output file for streaming JSON array
    const handle = await fs.open(outputFile, 'w');
    await handle.write('[');

    // Prepare failed products file for streaming JSON array
    const failedHandle = await fs.open(failedFile, 'w');
    await failedHandle.write('[');

    let first = true;
    let firstFailed = true;
    for (const product of products) {
        let enrichedObject;
        let isError = false;
        try {
            const seo = await getSeoFields(product);
            enrichedObject = {
                ...product,
                title_ar: seo.title_ar,
                title_en: seo.title_en,
                description_ar: seo.description_ar,
                description_en: seo.description_en,
                shortdescription_ar: seo.shortdescription_ar,
                shortdescription_en: seo.shortdescription_en
            };
            console.log(`Enriched product number ${counter++}: ${product.productId || product.title_ar}`);
        } catch (err) {
            isError = true;
            enrichedObject = {
                ...product,
                seo_error: err.message
            };
            console.error(`Failed: ${product.productId || product.title_ar}`);
        }

        if (!isError) {
            const toWrite = (first ? '' : ',\n') + JSON.stringify(enrichedObject, null, 2);
            await handle.write(toWrite);
            first = false;
        } else {
            const toWriteFailed = (firstFailed ? '' : ',\n') + JSON.stringify(enrichedObject, null, 2);
            await failedHandle.write(toWriteFailed);
            firstFailed = false;
        }
        // Delay to avoid Gemini rate-limits
        await new Promise(r => setTimeout(r, 1500));
    }

    await handle.write(']\n');
    await handle.close();
    await failedHandle.write(']\n');
    await failedHandle.close();
    console.log(`Done! Output -> ${outputFile}`);
    console.log(`Failed products -> ${failedFile}`);
}

// USAGE: node seo_enrich_gemini_stream.js input.json output.json
const [, , inputFile, outputFile] = process.argv;
const failedFile = "seo_failed_products.json";
if (!inputFile || !outputFile) {
    console.error('Usage: node seo_enrich_gemini_stream.js input.json output.json');
    process.exit(1);
}

enrichSeoStream(inputFile, outputFile, failedFile);