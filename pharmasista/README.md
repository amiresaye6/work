# Product Data Scraper

This script is designed to scrape product data from an e-commerce website (nahdionline.com) for products listed in a JSON file, specifically targeting products with `isExpress: true`. It extracts data in both Arabic (`ar-sa`) and English (`en-sa`) versions, aggregates category information, handles duplicate products, tracks progress, and logs failures for later analysis.

## Purpose

The script automates the process of collecting detailed product information, including:

- Product name, brand, description, and images.
- Category paths (main and subcategories) in both Arabic and English.
- Additional metadata from the input JSON (e.g., price, discount, position).

It ensures:

- Only `isExpress: true` products are scraped.
- Duplicate products (same `productId` in multiple categories) are scraped once but include all category paths.
- Progress is saved to resume from interruptions.
- Failed scrapes are logged for future handling.

## How It Works

### Input

- **Input JSON File**: A JSON file (e.g., `العناية_بالبشرة/أدوات_العناية_بالبشرة_إلكترونية.json`) containing an array of product objects with fields like:
  - `productId`, `title`, `url`, `imageUrl`, `price`, `originalPrice`, `discount`, `isExpress`, `position`, `main_category`, `sub_category`.
- The script processes only products where `isExpress: true`.

### Processing

1. **Filtering**: Skips products with `isExpress: false`.
2. **Scraping**:
   - Uses Puppeteer to navigate to each product's Arabic (`ar-sa`) and English (`en-sa`) URLs.
   - Extracts:
     - Product name (`productName`).
     - Brand (`brand`).
     - Category path (`categories`, e.g., `["Home", "Skincare", "Electronic Skincare Tools"]`).
     - Description (`description`, formatted with headers and lists).
     - Images (`images`, main and thumbnail images).
3. **Category Aggregation**:
   - Combines category paths from the input JSON (`main_category`, `sub_category`) and scraped data.
   - Stores full paths (`categories_ar`, `categories_en`) and unique main/subcategories (`main_categories_ar`, `main_categories_en`, `sub_categories_ar`, `sub_categories_en`).
   - Handles duplicates by updating existing product entries with new category paths.
4. **Progress Tracking**:
   - Saves processed product IDs to `progress.json`.
   - Resumes from the last processed product if interrupted.
5. **Error Handling**:
   - Logs failed scrapes (e.g., timeouts, selector errors) to `failed_products.json` with details (`productId`, URLs, error message, timestamp).
   - Continues processing other products after a failure.
6. **Output**:
   - Saves combined data to `combined_product_data.json` after each product.
   - Includes all fields from the input JSON and scraped data, structured by language (`ar` and `en`).

### Output Files

- `combined_product_data.json`:
  - Contains an array of product objects with fields like:
    - `productId`, `title_ar`, `title_en`, `url_ar`, `url_en`, `imageUrl`, `price`, `originalPrice`, `discount`, `isExpress`, `position`.
    - `brand_ar`, `brand_en`, `description_ar`, `description_en`, `images`.
    - `categories_ar`, `categories_en` (arrays of category paths).
    - `main_categories_ar`, `main_categories_en`, `sub_categories_ar`, `sub_categories_en` (unique categories).
  - Example:

    ```json
    [
      {
        "productId": "101785450",
        "title_ar": "اكسيز فرشاة تنظيف البشرة",
        "title_en": "Accez Facial Brush",
        "url_ar": "https://www.nahdionline.com/ar-sa/accez-facial-brush/pdp/101785450",
        "url_en": "https://www.nahdionline.com/en-sa/accez-facial-brush/pdp/101785450",
        "imageUrl": "https://ecombe.nahdionline.com/media/catalog/product/1/0/101785450.jpg",
        "price": "14.95 ر س",
        "originalPrice": "",
        "discount": "1 + 1 مجانا",
        "isExpress": true,
        "position": "1",
        "brand_ar": "Accez",
        "brand_en": "Accez",
        "categories_ar": [
          ["الرئيسية", "العناية بالبشرة", "أدوات العناية بالبشرة إلكترونية"],
          ["الرئيسية", "الأجهزة", "أجهزة العناية الشخصية"]
        ],
        "categories_en": [
          ["Home", "Skincare", "Electronic Skincare Tools"],
          ["Home", "Devices", "Personal Care Devices"]
        ],
        "main_categories_ar": ["العناية بالبشرة", "الأجهزة"],
        "main_categories_en": ["Skincare", "Devices"],
        "sub_categories_ar": ["أدوات العناية بالبشرة إلكترونية", "أجهزة العناية الشخصية"],
        "sub_categories_en": ["Electronic Skincare Tools", "Personal Care Devices"],
        "description_ar": "وصف المنتج:\n- فرشاة تنظيف البشرة للاستخدام اليومي\n- تساعد على إزالة الأوساخ والزيوت\nالفوائد:\n- تنظيف عميق\n- تحسين مظهر البشرة",
        "description_en": "Product Description:\n- Facial cleansing brush for daily use\n- Helps remove dirt and oils\nBenefits:\n- Deep cleansing\n- Improves skin appearance",
        "images": [
          "https://ecombe.nahdionline.com/media/catalog/product/1/0/101785450_main.jpg",
          "https://ecombe.nahdionline.com/media/catalog/product/1/0/101785450_thumb1.jpg"
        ]
      }
    ]
    ```
- `progress.json`:
  - Tracks processed `productId`s to enable resumption.
  - Example:

    ```json
    {
      "processedProductIds": ["101785450"]
    }
    ```
- `failed_products.json`:
  - Logs details of failed scrapes for later analysis.
  - Example:

    ```json
    [
      {
        "productId": "101785451",
        "url_ar": "https://www.nahdionline.com/ar-sa/another-product/pdp/101785451",
        "url_en": "https://www.nahdionline.com/en-sa/another-product/pdp/101785451",
        "error": {
          "ar": null,
          "en": "TimeoutError: Navigation timeout of 30000 ms exceeded"
        },
        "timestamp": "2025-04-29T12:00:00Z"
      }
    ]
    ```

## Setup

### Prerequisites

- **Node.js**: Version 14 or higher.
- **Puppeteer**: Install via npm for web scraping.
- **Input JSON File**: Place the input JSON file in the correct directory (e.g., `العناية_بالبشرة/أدوات_العناية_بالبشرة_إلكترونية.json`).

### Installation

1. Clone or download the script (`scrape_express_products_with_failure_logging.js`).
2. Install dependencies:

   ```bash
   npm install puppeteer
   ```
3. Ensure the input JSON file is in the specified path.

### Running the Script

1. Run the script:

   ```bash
   node scrape_express_products_with_failure_logging.js
   ```
2. The script will:
   - Process only `isExpress: true` products.
   - Save results to `combined_product_data.json`.
   - Track progress in `progress.json`.
   - Log failures to `failed_products.json`.

### Resuming

- If interrupted (e.g., crash, manual stop), rerun the script.
- It will:
  - Load `progress.json` to skip processed products.
  - Load `combined_product_data.json` to append or update data.
  - Load `failed_products.json` to preserve failure logs.
  - Continue from the last unprocessed express product.

## Key Features

1. **Express Product Filtering**:

   - Only processes products with `isExpress: true`, skipping others to optimize performance.

2. **Duplicate Product Handling**:

   - Products with the same `productId` appearing in multiple categories are scraped once.
   - Aggregates all category paths (e.g., `["Home", "Skincare", "Electronic Skincare Tools"]`, `["Home", "Devices", "Personal Care Devices"]`) into `categories_ar`/`en`.
   - Maintains unique main and subcategories in `main_categories_ar`/`en` and `sub_categories_ar`/`en`.

3. **Progress Tracking**:

   - Saves processed `productId`s to `progress.json` after each product.
   - Resumes from the last processed product, avoiding redundant scraping.

4. **Frequent Saving**:

   - Saves `combined_product_data.json`, `progress.json`, and `failed_products.json` after each product to prevent data loss.

5. **Error Handling**:

   - Catches errors during scraping (e.g., timeouts, missing elements) and logs them to `failed_products.json` with details.
   - Continues processing other products after a failure.
   - Saves progress and failure logs even if the script crashes.

6. **Category Aggregation**:

   - Combines category paths from input JSON and scraped data.
   - Deduplicates paths and extracts unique main/subcategories for easy querying.

## Troubleshooting

- **Timeout Errors**:
  - Increase the `timeout` in `page.goto` (currently 30,000 ms) if pages load slowly.
  - Check `failed_products.json` for failed URLs and retry them separately.
- **Selector Errors**:
  - If elements (e.g., `h1[data-badge="contentful"]`) are not found, the site’s structure may have changed. Update selectors in `getProductData`.
- **Missing Data**:
  - If `categories`, `description`, or `images` return `"not found"`, verify the site’s HTML structure.
- **Performance**:
  - For large datasets, frequent file saving may slow execution. Consider batch saving (e.g., every 10 products) by modifying the script.

Future Improvements

- **Batch Saving**: Save files every N products to reduce I/O overhead.
- **Retry Logic**: Automatically retry failed products from `failed_products.json`.
- **Multiple JSON Files**: Process multiple input JSON files (e.g., different categories) in one run.
- **Logging**: Add detailed logging to a file for debugging (e.g., timestamps, scrape durations).

## Notes

- The script assumes the input JSON file is in the path `العناية_بالبشرة/أدوات_العناية_بالبشرة_إلكترونية.json`. Update the path in `processProducts` if different.
- English category paths (`categories_en`) may rely on scraped data, as the input JSON provides Arabic categories (`main_category`, `sub_category`).
- Failed products in `failed_products.json` can be used to diagnose issues (e.g., site changes, network errors) or retry scraping.

This README should help you understand and use the script effectively when revisiting it in the future.