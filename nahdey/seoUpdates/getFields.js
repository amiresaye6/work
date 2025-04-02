const fs = require("fs");
const data = require("./صحة_المرأة-Products.json");

// Function to escape CSV fields
function escapeCsvField(field) {
  if (typeof field !== "string") return field; // Handle non-string values
  // If the field contains commas, line breaks, or double quotes, enclose it in quotes
  if (field.includes(",") || field.includes("\n") || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`; // Escape quotes by doubling them
  }
  return field; // Return as-is if no special characters
}

// Prepare the data for the CSV file
const csvData = data
  .map((record) => `${record.ID},${escapeCsvField(record.Seo_description)}`)
  .join("\n");

// Add headers to the CSV
const csvHeader = "ID,Description\n";
const csvContent = csvHeader + csvData;

// Write the CSV content to a file
const timestamp = new Date().toISOString().replace(/[:.-]/g, "_");
const filename = `output_${timestamp}.csv`;
fs.writeFileSync(filename, csvContent, "utf8");

console.log("CSV file created successfully!");