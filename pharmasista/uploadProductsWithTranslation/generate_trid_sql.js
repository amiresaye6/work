const fs = require('fs');

// Load exported JSON file
const data = JSON.parse(fs.readFileSync('pm (21).json', 'utf8'));
const products = data.find(d => d.type === 'table' && d.name === 'pm').data;

// Build a map for quick SKU lookup
const skuMap = {};
products.forEach(p => { skuMap[p.sku] = p; });

const updates = [];

products.forEach(ar => {
  if (ar.sku.startsWith('ar_')) {
    const number = ar.sku.substring(3);
    const enSku = 'en_' + number;
    const en = skuMap[enSku];
    if (en && ar.trid !== en.trid) {
      // Only add update if trids are different
      updates.push(
        `UPDATE wp_icl_translations SET trid = ${ar.trid} WHERE element_id = ${en.product_id} AND element_type = 'post_product';`
      );
    }
  }
});

if (updates.length) {
  fs.writeFileSync('trid19.sql', updates.join('\n') + '\n');
  console.log(`SQL statements written to update_trid.sql (${updates.length} updates).`);
} else {
  console.log('No updates necessary, all trids are already matched.');
}