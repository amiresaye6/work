const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Downloads an image from a URL and saves it to the specified path
 * @param {string} url - The URL of the image to download
 * @param {string} [outputPath] - Path where the image will be saved (optional)
 * @returns {Promise<string>} - Path to the saved image
 */
async function downloadImage(url, outputPath) {
    if (!outputPath) {
        const fileName = path.basename(url).split('?')[0] || 'downloaded-image.jpg';
        outputPath = path.join(__dirname, fileName);
    }

    const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        maxRedirects: 5,
    });

    const writer = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            fs.unlink(outputPath, () => reject(err));
        });
        writer.on('close', () => {
            if (!error) resolve(outputPath);
        });
    });
}

module.exports = { downloadImage };