require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateSeoLangPrompt } = require('./promptGenerator');
const fs = require('fs').promises;

let counter = 0;

// Setup Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Function to clean the description with regex
function cleanDescription(description) {
    if (!description) return description;
    return description.replace(/>\s*\n+\s*</g, '><');
}

// --- API CALL FOR SINGLE LANGUAGE ---
async function getSeoLangFields(product, language) {
    const prompt = generateSeoLangPrompt({
        oldDescription: language === 'ar' ? (product.description_ar || '') : (product.description_en || ''),
        oldTitle: language === 'ar' ? (product.title_ar || '') : (product.title_en || ''),
        brand: language === 'ar' ? (product.brand_ar || '') : (product.brand_en || ''),
        keywords: product.keywords || [],
        relatedLinkText: product.relatedLinkText || 'المزيد من المنتجات',
        relatedLinkURL: product.relatedLinkURL || 'https://ivitasa.com/product-category/%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%82-%d8%ad%d8%b3%d8%a8-%d8%a7%d9%84%d9%87%d8%af%d9%81/',
        language
    });

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

        const parsedJson = JSON.parse(jsonContent);

        // Clean description fields
        if (parsedJson.new_description_en) {
            parsedJson.new_description_en = cleanDescription(parsedJson.new_description_en);
        }
        if (parsedJson.new_description_ar) {
            parsedJson.new_description_ar = cleanDescription(parsedJson.new_description_ar);
        }
        if (parsedJson.short_description_en) {
            parsedJson.short_description_en = cleanDescription(parsedJson.short_description_en);
        }
        if (parsedJson.short_description_ar) {
            parsedJson.short_description_ar = cleanDescription(parsedJson.short_description_ar);
        }

        return parsedJson;
    } catch (err) {
        console.error(`Gemini error (${language}):`, err);
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
            // --- Separate API calls ---
            const seoEn = await getSeoLangFields(product, 'en');
            await new Promise(r => setTimeout(r, 1500)); // Rate-limit delay
            const seoAr = await getSeoLangFields(product, 'ar');

            enrichedObject = {
                ...product,
                ...seoEn,
                ...seoAr
            };
            console.log(`Enriched product number ${counter++}: ${product.productId || product.ID}`);
        } catch (err) {
            isError = true;
            enrichedObject = {
                ...product,
                seo_error: err.message
            };
            console.error(`Failed: ${product.productId || product.ID}`);
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
        // Delay to avoid Gemini rate-limits between products
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
const failedFile = "failed_seo_products.json";
if (!inputFile || !outputFile) {
    console.error('Usage: node seo_enrich_gemini_stream.js input.json output.json');
    process.exit(1);
}

enrichSeoStream(inputFile, outputFile, failedFile);