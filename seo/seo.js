require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateAIPrompt } = require('./promptGenerator');
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

    // Replace any pattern of '>' followed by any number of newlines/spaces, followed by '<'
    return description.replace(/>\s*\n+\s*</g, '><');
}

// Main function to get enriched fields using the new JSON-structured Arabic prompt
async function getSeoFields(product) {
    // Compose the prompt using the imported function
    const prompt = generateAIPrompt({
        oldDescription: product.oldDescription || '',
        oldTitle: product.Name || '',
        keywords: product.keywords || [],
        relatedLinkText: product.relatedLinkText || '',
        relatedLinkURL: product.relatedLinkURL || '',
        ID: product.ID
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

        // Apply regex formatter to description field if it exists
        if (parsedJson.description) {
            parsedJson.description = cleanDescription(parsedJson.description);
        }

        return parsedJson;
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
                ...seo // merge fields from AI JSON (title, description, etc.)
            };
            console.log(`Enriched product number ${counter++}: ${product.ID}`);
        } catch (err) {
            isError = true;
            enrichedObject = {
                ...product,
                seo_error: err.message
            };
            console.error(`Failed: ${product.ID}`);
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
const failedFile = "failed_seo_products.json";
if (!inputFile || !outputFile) {
    console.error('Usage: node seo.js input.json output.json');
    process.exit(1);
}

enrichSeoStream(inputFile, outputFile, failedFile);