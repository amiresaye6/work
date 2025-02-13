const fs = require("fs");
const { parse } = require("json2csv");

// Define the CSV headers as per the given fields
const fields = [
  "ID", "Type", "SKU", "GTIN, UPC, EAN, or ISBN", "Name", "Published", "Is featured?", 
  "Visibility in catalog", "Short description", "Description", "Date sale price starts", 
  "Date sale price ends", "Tax status", "Tax class", "In stock?", "Stock", "Low stock amount", 
  "Backorders allowed?", "Sold individually?", "Weight (kg)", "Length (cm)", "Width (cm)", 
  "Height (cm)", "Allow customer reviews?", "Purchase note", "Sale price", "Regular price", 
  "Categories", "Tags", "Shipping class", "Images", "Download limit", "Download expiry days", 
  "Parent", "Grouped products", "Upsells", "Cross-sells", "External URL", "Button text", 
  "Position", "Brands", "Attribute 1 name", "Attribute 1 value(s)", "Attribute 1 visible", 
  "Attribute 1 global", "Attribute 2 name", "Attribute 2 value(s)", "Attribute 2 visible", 
  "Attribute 2 global", "Meta: _wp_page_template", "Meta: woodmart_sguide_select", 
  "Meta: _woodmart_whb_header", "Meta: _woodmart_single_product_style", "Meta: _woodmart_thums_position", 
  "Meta: _woodmart_extra_position", "Meta: _woodmart_product_design", "Meta: _woodmart_product_custom_tab_content_type", 
  "Meta: _woodmart_product_custom_tab_content_type_2", "Meta: _elementor_template_type", "Meta: _elementor_version", 
  "Meta: _elementor_data", "Meta: woodmart_price_unit_of_measure", "Meta: woodmart_total_stock_quantity", 
  "Meta: _product_360_image_gallery", "Meta: _woodmart_main_layout", "Meta: _woodmart_sidebar_width", 
  "Meta: _woodmart_custom_sidebar", "Meta: _woodmart_new_label", "Meta: _woodmart_new_label_date", 
  "Meta: _woodmart_swatches_attribute", "Meta: _woodmart_related_off", "Meta: _woodmart_exclude_show_single_variation", 
  "Meta: _woodmart_product_video", "Meta: _woodmart_product_hashtag", "Meta: _woodmart_extra_content", 
  "Meta: _woodmart_product-background", "Meta: _woodmart_hide_tabs_titles", "Meta: _woodmart_product_custom_tab_title", 
  "Meta: _woodmart_product_custom_tab_content", "Meta: _woodmart_product_custom_tab_html_block", 
  "Meta: _woodmart_product_custom_tab_title_2", "Meta: _woodmart_product_custom_tab_content_2", 
  "Meta: _woodmart_product_custom_tab_html_block_2", "Meta: _wpml_media_featured", "Meta: _wpml_word_count", 
  "Meta: _wpml_media_duplicate", "Meta: _last_translation_edit_mode", "Meta: mwb_product_points_enable", 
  "Meta: mwb_points_product_value", "Meta: mwb_product_purchase_points_only", "Meta: mwb_points_product_purchase_value", 
  "Meta: _wpml_location_migration_done", "Meta: _wcml_custom_prices_status", "Meta: _wpml_post_translation_editor_native", 
  "External URL"
];

// Sample JSON object
const jsonData = {
  "ID": "",
  "Type": "",
  "SKU": "N/A",
  "GTIN, UPC, EAN, or ISBN": "",
  "Name": "حامض الفوليك 1 مجم 20 قرص",
  "Published": "",
  "Is featured?": "",
  "Visibility in catalog": "",
  "Short description": "",
  "Description": "وصف المنتج:\n\nلعلاج فقر الدم الناجم عن نقص الفولات...",
  "Date sale price starts": "",
  "Date sale price ends": "",
  "Tax status": "",
  "Tax class": "",
  "In stock?": "",
  "Stock": "",
  "Low stock amount": "",
  "Backorders allowed?": "",
  "Sold individually?": "",
  "Weight (kg)": "",
  "Length (cm)": "",
  "Width (cm)": "",
  "Height (cm)": "",
  "Allow customer reviews?": "",
  "Purchase note": "",
  "Sale price": "6.90 ر س",
  "Regular price": "",
  "Categories": "",
  "Tags": "",
  "Shipping class": "",
  "Images": "https://www.nahdionline.com/media/catalog/product/f/o/folic-acid-1-mg-20-tab-00_1.jpg",
  "Download limit": "",
  "Download expiry days": "",
  "Parent": "",
  "Grouped products": "",
  "Upsells": "",
  "Cross-sells": "",
  "External URL": "https://www.nahdionline.com/ar/folic-acid-1-mg-20-tab",
  "Button text": "",
  "Position": "",
  "Brands": "حامض الفوليك",
  "Attribute 1 name": "قوام المنتج",
  "Attribute 1 value(s)": "أقراص",
  "Attribute 1 visible": "",
  "Attribute 1 global": "",
  "Meta: _wpml_location_migration_done": ""
};

// Convert JSON to CSV
const opts = { fields, defaultValue: "" };
const csv = parse([jsonData], opts);

// Save CSV to file
fs.writeFileSync("output.csv", csv, "utf8");

console.log("CSV file created successfully.");
