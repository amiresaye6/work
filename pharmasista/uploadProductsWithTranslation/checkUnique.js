/**
 * JSON Duplicate Checker
 *
 * This script analyzes an array of objects from a JSON file to find duplicates
 * based on a specified unique identifier path.
 *
 * Usage:
 * node script.js <path_to_json_file> <nested_id_path>
 *
 * Example:
 * node script.js data.json id
 * node script.js data.json user.profile.email
 */

const fs = require('fs');
const path = require('path');

// --- Helper Functions ---

/**
 * Safely retrieves a nested property from an object using a dot-notation string.
 * @param {object} obj The object to query.
 * @param {string} keyPath The dot-notation path to the property (e.g., 'parent.child.key').
 * @returns {*} The value of the property, or undefined if the path is invalid.
 */
const getNestedValue = (obj, keyPath) => {
  if (typeof keyPath !== 'string') return undefined;
  return keyPath.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// --- Main Logic ---

const main = () => {
  // 1. Get command line arguments
  const [,, filePath, idPath] = process.argv;

  // 2. Validate arguments
  if (!filePath || !idPath) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing arguments.');
    console.log('Usage: node script.js <path_to_json_file> <nested_id_path>');
    console.log('Example: node script.js my_data.json user.id');
    process.exit(1); // Exit with an error code
  }

  try {
    // 3. Read and parse the JSON file
    const fullPath = path.resolve(filePath);
    console.log(`\n🔍 Analyzing file: ${fullPath}`);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data)) {
      console.error('\x1b[31m%s\x1b[0m', 'Error: The JSON file must contain an array of objects.');
      process.exit(1);
    }

    // 4. Count occurrences of each ID
    const idCounts = new Map();
    let invalidPathCount = 0;
    
    data.forEach(item => {
      const id = getNestedValue(item, idPath);
      if (id !== undefined && id !== null) {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      } else {
        invalidPathCount++;
      }
    });

    // 5. Analyze the counts to find uniques and duplicates
    const duplicateDetails = {};
    let uniqueObjectCount = 0;
    let duplicateObjectCount = 0;

    idCounts.forEach((count, id) => {
      if (count === 1) {
        uniqueObjectCount++;
      } else {
        duplicateDetails[id] = count;
        duplicateObjectCount += count;
      }
    });
    
    const duplicateValueCount = Object.keys(duplicateDetails).length;


    // 6. Display the report
    console.log('\n--- Analysis Report ---');
    console.log(`Total Objects in File:      ${data.length}`);
    if (invalidPathCount > 0) {
        console.log(`Objects with Missing ID Path: ${invalidPathCount} (Path: "${idPath}")`);
    }
    console.log('-------------------------');
    console.log(`Unique Objects:             ${uniqueObjectCount}`);
    console.log(`Duplicate Objects:          ${duplicateObjectCount}`);
    console.log('-------------------------');
    
    if (duplicateValueCount > 0) {
      console.log(`\nFound ${duplicateValueCount} value(s) that are duplicated. Details below:`);
      console.log('Value -> Total Occurrences');
      console.table(duplicateDetails);
    } else {
      console.log('\n\x1b[32m%s\x1b[0m', '✅ All objects are unique based on the specified key.');
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('\x1b[31m%s\x1b[0m', `Error: File not found at path: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      console.error('\x1b[31m%s\x1b[0m', `Error: Invalid JSON in file: ${filePath}. Could not parse.`);
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'An unexpected error occurred:', error.message);
    }
    process.exit(1);
  }
};

// Run the main function
main();
