function generateSeoLangPrompt({
  oldDescription,
  oldTitle,
  keywords = [],
  relatedLinkText = 'المزيد من المنتجات',
  relatedLinkURL = 'https://ivitasa.com/product-category/%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%82-%d8%ad%d8%b3%d8%a8-%d8%a7%d9%84%d9%87%d8%af%d9%81/',
  brand = '',
  language = 'ar'
}) {
  const isArabic = language === 'ar';
  const titleField = isArabic ? 'new_title_ar' : 'new_title_en';
  const descField = isArabic ? 'new_description_ar' : 'new_description_en';
  const shortDescField = isArabic ? 'short_description_ar' : 'short_description_en';
  const seoKeywordField = isArabic ? 'seo_keyword_ar' : 'seo_keyword_en';
  const internalLinkField = isArabic ? 'internal_link_ar' : 'internal_link_en';
  const internalLinkText = isArabic ? relatedLinkText : 'See more products';

  return `
You are an AI assistant transforming old supplement product descriptions into modern, SEO-optimized, structured JSON format in ${isArabic ? 'Arabic' : 'English'}.

🎯 TASK:
- Receive old product title and description in ${isArabic ? 'Arabic' : 'English'}.
- Generate new SEO-optimized title and description, addressing the following roles (text only):

  1. For the new title (${titleField}), follow this strict structure:
     - [Brand] [Product Name] [Dosage/Size] [Type/Format] [Target] (as in "اديداس فرش انديورنس رول مزيل عرق للرجال 50 مل" or "Adidas Fresh Endurance Roll-on Deodorant for Men 50ml").
     - Make sure the title is natural, readable, and contains the Focus Keyword as a full slice, not a joined phrase.
  2. Choose a strong Focus Keyword (${seoKeywordField}) for this product in ${isArabic ? 'Arabic' : 'English'}. This should be a natural slice of the new title and the keyword must appear in the new title exactly as it is.
  3. Ensure the Focus Keyword is in the meta description, URL, first 10% of content, and subheading(s).
  4. Write at least 600 words per description if possible.
  5. Use Focus Keyword in short paragraphs and at least one subheading.
  6. Ensure the title uses the Focus Keyword at the beginning, contains a power word, and has either a positive/negative sentiment.
  7. Generate a short description (max 35 words), summarizing the product, using HTML only.
  8. Add internal linking text referencing related products ("${internalLinkText}")—this must be appended at the end of the description HTML.
  9. Use the Focus Keyword in the first 10% of the content.
  10. Use at least one bulleted list in the description.
  11. Write in a marketing style, clear, concise, and readable.

🧱 Output Format (JSON):
{
  "${titleField}": "...",
  "${descField}": "<div>...</div>", // HTML only, ends with internal link HTML!
  "${shortDescField}": "<p>...</p>", // HTML only
  "${seoKeywordField}": "..." ,
  "${internalLinkField}": "<a href='${relatedLinkURL}' ...>${internalLinkText}</a>"
}

🔤 FORMAT NOTES:
- All description and short_description fields MUST be valid HTML. DO NOT use markdown.
- Structure all descriptions using <h2>, <ul>, <li>, <p>, etc. as appropriate for web content.
- Append the internal_link HTML to the END of the description field.
- Do not include markdown anywhere.
- Return only valid JSON, no markdown, no explanation.

Input Data:
-----------
Brand: ${brand}
Old Title: ${oldTitle}
Old Description: ${oldDescription}
-----------
    `.trim();
}

module.exports = { generateSeoLangPrompt };