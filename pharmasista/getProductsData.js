// const puppeteer = require('puppeteer');

// async function getProductData(url) {
//   try {
//     // Launch Puppeteer browser in headless mode for efficiency
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Navigate to the provided URL
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

//     // Extract data from the page
//     const productData = await page.evaluate(() => {
//       // Extract breadcrumb text
//       const breadcrumbElement = document.querySelector('div.my-4.hidden.text-xs.md\\:flex nav');
//       const breadcrumbText = breadcrumbElement
//         ? Array.from(breadcrumbElement.querySelectorAll('li a'))
//             .map(item => item.textContent.trim())
//             .join(' > ')
//         : 'Breadcrumb not found';

//       // Extract product name
//       const productNameElement = document.querySelector('h1[data-badge="contentful"]');
//       const productName = productNameElement
//         ? productNameElement.textContent.trim()
//         : 'Product name not found';

//       // Extract brand
//       const brandElement = document.querySelector('div.flex.items-center.space-x-2 a span span');
//       const brand = brandElement
//         ? brandElement.textContent.trim()
//         : 'Brand not found';

//       return {
//         breadcrumb: breadcrumbText,
//         productName: productName,
//         brand: brand
//       };
//     });

//     // Close the browser
//     await browser.close();

//     return productData;
//   } catch (error) {
//     console.error('Error:', error);
//     return {
//       breadcrumb: 'An error occurred',
//       productName: 'An error occurred',
//       brand: 'An error occurred'
//     };
//   }
// }

// // Example usage
// (async () => {
//   const url = 'https://www.nahdionline.com/en-sa/cetaphil-moisturizing-cream-for-dry-to-very-dry-550-gm/pdp/101498362';
//   const result = await getProductData(url);
//   console.log(result);
// })();






// const puppeteer = require('puppeteer');

// async function getProductDescription(url) {
//   try {
//     // Launch Puppeteer browser in headless mode for efficiency
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Navigate to the provided URL
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

//     // Extract description data from the page
//     const descriptionData = await page.evaluate(() => {
//       const sectionElement = document.querySelector('div.pdp-about-section');
//       if (!sectionElement) {
//         return { description: 'Description section not found' };
//       }

//       const description = {};

//       // Extract each subsection by finding <p><strong> elements and their following content
//       const subsections = sectionElement.querySelectorAll('p > strong');
//       subsections.forEach((strong) => {
//         const title = strong.textContent.trim().replace(':', '');
//         let content = '';
//         let nextElement = strong.parentElement.nextElementSibling;

//         // Collect content from the next <ul> or text
//         if (nextElement && nextElement.tagName === 'UL') {
//           const items = nextElement.querySelectorAll('li');
//           content = Array.from(items)
//             .map((item) => item.textContent.trim())
//             .join('; ');
//         } else if (nextElement) {
//           content = nextElement.textContent.trim();
//         }

//         description[title] = content || 'No content found';
//       });

//       return { description };
//     });

//     // Close the browser
//     await browser.close();

//     return descriptionData;
//   } catch (error) {
//     console.error('Error:', error);
//     return { description: 'An error occurred' };
//   }
// }

// // Example usage
// (async () => {
//   const url = 'https://www.nahdionline.com/en-sa/givenchy-linterdit-eau-de-parfum-for-women-80-ml/pdp/103187509'; // Replace with the actual URL
//   const result = await getProductDescription(url);
//   console.log(JSON.stringify(result, null, 2));
// })();




// const puppeteer = require('puppeteer');

// async function getProductDescription(url) {
//   try {
//     // Launch Puppeteer browser in headless mode for efficiency
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Navigate to the provided URL
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

//     // Extract description data from the page
//     const descriptionData = await page.evaluate(() => {
//       const sectionElement = document.querySelector('div.pdp-about-section');
//       if (!sectionElement) {
//         return { description: 'Description section not found' };
//       }

//       let description = '';

//       // Function to process a node and determine its type
//       function processNode(node, indentLevel = 0) {
//         let output = '';

//         if (!node) return output;

//         // Handle <p> with <strong> as primary header
//         if (node.tagName === 'P' && node.querySelector('strong')) {
//           const headerText = node.querySelector('strong').textContent.trim().replace(':', '');
//           output += `${headerText}:\n`;
//         }
//         // Handle <p> as paragraph
//         else if (node.tagName === 'P') {
//           const text = node.textContent.trim();
//           if (text && !node.querySelector('strong')) {
//             output += `${text}\n`;
//           }
//         }
//         // Handle <ul> as list
//         else if (node.tagName === 'UL') {
//           const items = node.querySelectorAll('li');
//           items.forEach((li) => {
//             const liText = li.textContent.trim();
//             // Check if <li> contains <strong> or looks like a secondary header (e.g., bolded or short)
//             if (li.querySelector('strong') || liText.length < 50 && liText.includes(':')) {
//               output += `:: ${liText}\n`;
//             } else {
//               output += `- ${liText}\n`;
//             }
//           });
//         }
//         // Handle <div> by processing its children
//         else if (node.tagName === 'DIV') {
//           const children = node.childNodes;
//           children.forEach((child) => {
//             if (child.nodeType === 1) { // Element node
//               output += processNode(child, indentLevel);
//             }
//           });
//         }

//         return output;
//       }

//       // Process all child nodes of the description section
//       const children = sectionElement.childNodes;
//       children.forEach((child) => {
//         if (child.nodeType === 1) { // Element node
//           description += processNode(child);
//         }
//       });

//       return { description: description.trim() || 'No description content found' };
//     });

//     // Close the browser
//     await browser.close();

//     return descriptionData;
//   } catch (error) {
//     console.error('Error:', error);
//     return { description: 'An error occurred' };
//   }
// }

// // Example usage
// (async () => {
//   const url = 'https://www.nahdionline.com/en-sa/gucci-flora-gorgeous-gardenia-eau-de-parfum-for-women-30-ml/pdp/103190396';
//   const result = await getProductDescription(url);
//   console.log(result.description);
// })();





// const puppeteer = require('puppeteer');
// const fs = require('fs').promises;

// async function getProductData(url) {
//   try {
//     // Launch Puppeteer browser in headless mode for efficiency
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Navigate to the provided URL
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

//     // Extract data from the page
//     const productData = await page.evaluate(() => {
//       // Extract breadcrumb (categories)
//       const breadcrumbElement = document.querySelector('div.my-4.hidden.text-xs.md\\:flex nav');
//       const categories = breadcrumbElement
//         ? Array.from(breadcrumbElement.querySelectorAll('li a'))
//             .map(item => item.textContent.trim())
//         : ['Breadcrumb not found'];

//       // Extract product name
//       const productNameElement = document.querySelector('h1[data-badge="contentful"]');
//       const productName = productNameElement
//         ? productNameElement.textContent.trim()
//         : 'Product name not found';

//       // Extract brand
//       const brandElement = document.querySelector('div.flex.items-center.space-x-2 a span span');
//       const brand = brandElement
//         ? brandElement.textContent.trim()
//         : 'Brand not found';

//       // Extract description
//       const sectionElement = document.querySelector('div.pdp-about-section');
//       let description = '';

//       if (sectionElement) {
//         // Function to process a node and determine its type
//         function processNode(node, indentLevel = 0) {
//           let output = '';

//           if (!node) return output;

//           // Handle <p> with <strong> as primary header
//           if (node.tagName === 'P' && node.querySelector('strong')) {
//             const headerText = node.querySelector('strong').textContent.trim().replace(':', '');
//             output += `${headerText}:\n`;
//           }
//           // Handle <p> as paragraph
//           else if (node.tagName === 'P') {
//             const text = node.textContent.trim();
//             if (text && !node.querySelector('strong')) {
//               output += `${text}\n`;
//             }
//           }
//           // Handle <ul> as list
//           else if (node.tagName === 'UL') {
//             const items = node.querySelectorAll('li');
//             items.forEach((li) => {
//               const liText = li.textContent.trim();
//               // Check if <li> contains <strong> or looks like a secondary header
//               if (li.querySelector('strong') || liText.length < 50 && liText.includes(':')) {
//                 output += `:: ${liText}\n`;
//               } else {
//                 output += `- ${liText}\n`;
//               }
//             });
//           }
//           // Handle <div> by processing its children
//           else if (node.tagName === 'DIV') {
//             const children = node.childNodes;
//             children.forEach((child) => {
//               if (child.nodeType === 1) { // Element node
//                 output += processNode(child, indentLevel);
//               }
//             });
//           }

//           return output;
//         }

//         // Process all child nodes of the description section
//         const children = sectionElement.childNodes;
//         children.forEach((child) => {
//           if (child.nodeType === 1) { // Element node
//             description += processNode(child);
//           }
//         });
//       } else {
//         description = 'Description section not found';
//       }

//       return {
//         productName: productName,
//         brand: brand,
//         categories: categories,
//         description: description.trim() || 'No description content found'
//       };
//     });

//     // Close the browser
//     await browser.close();

//     // Save data to JSON file
//     await fs.writeFile('product_data.json', JSON.stringify(productData, null, 2));

//     return productData;
//   } catch (error) {
//     console.error('Error:', error);
//     const errorData = {
//       productName: 'An error occurred',
//       brand: 'An error occurred',
//       categories: ['An error occurred'],
//       description: 'An error occurred'
//     };
//     // Save error data to JSON file
//     await fs.writeFile('product_data.json', JSON.stringify(errorData, null, 2));
//     return errorData;
//   }
// }

// // Example usage
// (async () => {
//   const url = 'https://www.nahdionline.com/en-sa/cerave-moisturizing-cream-for-dry-skin-with-hyaluronic-acid-50-ml/pdp/102478523';
//   const result = await getProductData(url);
//   console.log('Data saved to product_data.json:', result);
// })();


const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function getProductData(url) {
  try {
    // Launch Puppeteer browser in headless mode for efficiency
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract data from the page
    const productData = await page.evaluate(() => {
      // Debug: Log to check if page is loaded correctly
      console.log('Evaluating page content...');

      // Extract breadcrumb (categories)
      const breadcrumbElement = document.querySelector('div.my-4.hidden.text-xs.md\\:flex nav');
      const categories = breadcrumbElement
        ? Array.from(breadcrumbElement.querySelectorAll('li a'))
            .map(item => item.textContent.trim())
        : ['Breadcrumb not found'];

      // Extract product name
      const productNameElement = document.querySelector('h1[data-badge="contentful"]');
      const productName = productNameElement
        ? productNameElement.textContent.trim()
        : 'Product name not found';

      // Extract brand
      const brandElement = document.querySelector('div.flex.items-center.space-x-2 a span span');
      const brand = brandElement
        ? brandElement.textContent.trim()
        : 'Brand not found';

      // Extract description
      const sectionElement = document.querySelector('div.pdp-about-section');
      let description = '';

      if (sectionElement) {
        // Function to process a node and determine its type
        function processNode(node, indentLevel = 0) {
          let output = '';

          if (!node) return output;

          // Handle <p> with <strong> as primary header
          if (node.tagName === 'P' && node.querySelector('strong')) {
            const headerText = node.querySelector('strong').textContent.trim().replace(':', '');
            output += `${headerText}:\n`;
          }
          // Handle <p> as paragraph
          else if (node.tagName === 'P') {
            const text = node.textContent.trim();
            if (text && !node.querySelector('strong')) {
              output += `${text}\n`;
            }
          }
          // Handle <ul> as list
          else if (node.tagName === 'UL') {
            const items = node.querySelectorAll('li');
            items.forEach((li) => {
              const liText = li.textContent.trim();
              // Check if <li> contains <strong> or looks like a secondary header
              if (li.querySelector('strong') || liText.length < 50 && liText.includes(':')) {
                output += `:: ${liText}\n`;
              } else {
                output += `- ${liText}\n`;
              }
            });
          }
          // Handle <div> by processing its children
          else if (node.tagName === 'DIV') {
            const children = node.childNodes;
            children.forEach((child) => {
              if (child.nodeType === 1) { // Element node
                output += processNode(child, indentLevel);
              }
            });
          }

          return output;
        }

        // Process all child nodes of the description section
        const children = sectionElement.childNodes;
        children.forEach((child) => {
          if (child.nodeType === 1) { // Element node
            description += processNode(child);
          }
        });
      } else {
        description = 'Description section not found';
      }

      // Extract images
      const images = [];
      
      // Main image: Try multiple selectors
      let mainImageElement = null;
      const mainImageSelectors = [
        'div.h-\\\[400px\\\] img', // Escaped Tailwind class
        'div.relative.aspect-square img', // Fallback based on parent structure
        'div.lg\\:max-w-\\[427px\\] img' // Broader parent container
      ];

      for (const selector of mainImageSelectors) {
        mainImageElement = document.querySelector(selector);
        console.log(`Trying main image selector: ${selector}, Found: ${!!mainImageElement}`);
        if (mainImageElement) break;
      }

      if (mainImageElement) {
        images.push(mainImageElement.src);
      } else {
        console.log('Main image not found with any selector');
      }

      // Thumbnail images
      const thumbnailElements = document.querySelectorAll('div.swiper-wrapper img');
      console.log(`Found ${thumbnailElements.length} thumbnail images`);
      thumbnailElements.forEach((img) => {
        if (!images.includes(img.src)) { // Avoid duplicates
          images.push(img.src);
        }
      });

      return {
        productName: productName,
        brand: brand,
        categories: categories,
        description: description.trim() || 'No description content found',
        images: images.length > 0 ? images : ['No images found']
      };
    });

    // Close the browser
    await browser.close();

    // Save data to JSON file
    await fs.writeFile('product_data.json', JSON.stringify(productData, null, 2));

    return productData;
  } catch (error) {
    console.error('Error:', error);
    const errorData = {
      productName: 'An error occurred',
      brand: 'An error occurred',
      categories: ['An error occurred'],
      description: 'An error occurred',
      images: ['An error occurred']
    };
    // Save error data to JSON file
    await fs.writeFile('product_data.json', JSON.stringify(errorData, null, 2));
    return errorData;
  }
}

// Example usage
(async () => {
  const url = 'https://www.nahdionline.com/en-sa/yves-saint-laurent-black-opium-eau-de-parfum-for-women-90-ml/pdp/101134526';
  const result = await getProductData(url);
  console.log('Data saved to product_data.json:', result);
})();