const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Downloads an image from a URL and saves it to the specified path
 * @param {string} url - The URL of the image to download
 * @param {string} [outputPath] - Path where the image will be saved (optional)
 * @returns {Promise<string>} - Path to the saved image
 */
async function downloadImage(url, outputPath) {
    // If no output path is provided, create one based on the URL
    if (!outputPath) {
        const fileName = path.basename(url).split('?')[0] || 'downloaded-image.jpg';
        outputPath = path.join(__dirname, fileName);
    }

    return new Promise((resolve, reject) => {
        // Select the appropriate protocol
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return resolve(downloadImage(response.headers.location, outputPath));
            }

            // Check if the request was successful
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download image: ${response.statusCode}`));
            }

            // Create a write stream to save the image
            const fileStream = fs.createWriteStream(outputPath);
            
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Image downloaded to: ${outputPath}`);
                resolve(outputPath);
            });
            
            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Delete the file on error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Example usage
// downloadImage('https://www.nahdionline.com/_next/image?url=https%3A%2F%2Fecombe.nahdionline.com%2Fmedia%2Fcatalog%2Fproduct%2F1%2F0%2F102364294_small_image_6426cc4c9ea1c17f9_93797.jpg%3Fwidth%3D500%26height%3D500%26canvas%3D500%2C500%26optimize%3Dhigh%26bg-color%3D255%2C255%2C255%26fit%3Dbounds&w=256&q=75', './downloaded-image.jpg')
//   .then(path => console.log(`Image downloaded successfully to ${path}`))
//   .catch(error => console.error('Error downloading image:', error));

module.exports = { downloadImage };