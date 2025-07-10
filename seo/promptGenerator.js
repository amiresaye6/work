function generateAIPrompt({
  oldDescription,
  keywords = [],
  relatedLinkText = 'المزيد من المنتجات',
  relatedLinkURL = 'https://ivitasa.com/'
}) {
  const keywordStr = keywords.join(', ');

  // Build the custom link HTML as described in your example
  const linkHTML = `<p style="cursor: pointer"><span>🔗</span> <a href="${relatedLinkURL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;"></a> ${relatedLinkText}</p>`;

  return `
You are an AI assistant transforming old supplement product descriptions into modern, SEO-optimized, structured JSON format.<br/><br/>

<strong>🎯 TASK:</strong><br/>
Reformat the provided product description into an Arabic marketing-style format with strong structure and SEO value. Follow the exact structure below and return a valid JSON object. Remove all emojis, hashtags, and unstructured elements.<br/>
<hr/>

<strong>🧱 JSON OUTPUT STRUCTURE</strong><br/>
<pre><code>{
  "title": "Formatted product name with brand – brief health benefit",
  "description": "&lt;h2&gt;[title]: [extra benefit headline]&lt;/h2&gt;<br/>&lt;p&gt;Engaging intro describing the health need this product solves.&lt;/p&gt;<br/><br/>&lt;p&gt;Followed by a short paragraph introducing the brand and product quality.&lt;/p&gt;<br/><br/>&lt;h2&gt;مواصفات المنتج&lt;/h2&gt;<br/>&lt;ul&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Main ingredient and dosage (e.g., يحتوي كل قرص على...)&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Suitability (vegan, gluten-free, etc.)&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Package size or daily usage duration&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Manufacturing or quality assurance info&lt;/li&gt;<br/>&lt;/ul&gt;<br/><br/>&lt;h2&gt;فوائد المنتج&lt;/h2&gt;<br/>&lt;ul&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Health benefit 1&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Health benefit 2&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Health benefit 3&lt;/li&gt;<br/>&nbsp; &nbsp; &lt;li&gt;Health benefit 4&lt;/li&gt;<br/>&lt;/ul&gt;<br/><br/>&lt;p&gt;Closing summary paragraph encouraging daily use for better health.&lt;/p&gt;<br/><br/>${linkHTML.replace(/"/g, '&quot;')}",
  "keywords": "${keywordStr}"
}
</code></pre>
<br/>
<strong>🔤 FORMAT NOTES:</strong><br/>
- The value of <code>title</code> must be in the format: <b>Product Name Brand – Brief Health Benefit</b> (for example: فيتامين ص شركة س – الحل الأمثل لدعم مناعتك)<br/>
- The value of <code>description</code> must begin with an <code>&lt;h2&gt;</code> and contain the product name, brand, and a concise benefit headline, like: <code>&lt;h2&gt;فيتامين ص شركة س: الحل الأمثل لدعم مناعتك بطريقة طبيعية&lt;/h2&gt;</code>.<br/>
- Continue the rest of the description as described below the <code>&lt;h2&gt;</code>.<br/>
<hr/>

<strong>🔁 INPUT OLD DESCRIPTION:</strong><br/>
<pre>${oldDescription}</pre>
  `.trim();
}

module.exports = { generateAIPrompt };