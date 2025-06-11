# Multilingual WooCommerce Product Workflow

This document outlines the steps required to manage and synchronize multilingual (Arabic and English) product data for a WooCommerce store.

---

## 1. Data Scraping

Scrape product data in both Arabic and English:

```bash
node getProudctsData.js
```

*✅ Script completed.*

---

## 2. SEO & Product Content Enrichment

Use AI to generate:

- Updated SEO descriptions  
- Improved short descriptions  
- Optimized product names

Run the script:

```bash
node seo_enrich_gemini_Version2.js input.json output.json
```

> ⚠️ Prompt may need enhancement for better results.

---

## 3. Map Category Names

Standardize or translate product categories to ensure consistent taxonomy between Arabic and English versions.

*🛠️ Manual or script-based mapping required.*

---

## 4. Prepare Upload Files

Once category names are mapped, generate the product files:

### Step 1: Generate JSON files for upload

```bash
node script.js
```

This will output:

- `products_ar.json`
- `products_en.json`

### Step 2: Convert JSON to CSV

Run the following to convert each language version to a WordPress-compatible CSV:

```bash
node convert.js products_ar.json
node convert.js products_en.json
```

These CSVs will be used in the next upload step.

---

## 5. Upload Arabic Products

Import the Arabic-language products via WordPress:

1. Use the WordPress admin dashboard  
2. Navigate to **Products > Import**  
3. Upload the Arabic products CSV file (`converted_ar.csv` or similar)

---

## 6. Upload English Products

Repeat the same process for English products:

1. Go to **Products > Import**  
2. Upload the English products CSV file (`converted_en.csv` or similar)

---

## 7. Link Arabic and English Products in the Database

### Step 1: Export Current Product Translation Info

Run the following SQL in **phpMyAdmin**:

```sql
SELECT
  pm.post_id AS product_id,
  pm.meta_value AS sku,
  t.trid
FROM wp_postmeta pm
JOIN wp_icl_translations t
  ON t.element_id = pm.post_id
  AND t.element_type = 'post_product'
WHERE pm.meta_key = '_sku'
  AND (pm.meta_value LIKE 'ar\_%' OR pm.meta_value LIKE 'en\_%');
```

This will output:

- `product_id`  
- `sku`  
- `trid`

### Step 2: Generate SQL for Linking

Use the script to generate UPDATE statements:

```bash
node generate_trid_sql.js
```

This script will:

- Match Arabic and English products by SKU number  
- Skip already linked products (idempotent)  
- Output a `update_trid.sql` file

### Step 3: Import SQL File

In **phpMyAdmin**:

1. Open the **Import** tab  
2. Upload `update_trid.sql`  
3. Execute the file to apply product translations linking

---

## 🌀 Repeatability

This process is **safe to run multiple times**. Products with matching `trid` values will be skipped, ensuring no duplicates or overwrite errors occur.
