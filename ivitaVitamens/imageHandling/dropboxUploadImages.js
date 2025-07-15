const { Dropbox } = require('dropbox');
const fetch = require('node-fetch'); // For Node.js <18; use global fetch for Node.js 18+

/**
 * Uploads images from URLs to Dropbox and returns direct links.
 * @param {string[]} imageUrls - Array of image URLs.
 * @param {string} dropboxFolder - Dropbox path (e.g., '/folder1/folder2/').
 * @param {string} accessToken - Dropbox API access token.
 * @returns {Promise<string[]>} Array of Dropbox direct image links.
 */
async function uploadImagesToDropbox(imageUrls, dropboxFolder, accessToken) {
  const dbx = new Dropbox({ accessToken, fetch });
  const shareLinks = [];

  for (const imgUrl of imageUrls) {
    // Get the file name from the URL
    const urlParts = imgUrl.split('/');
    let fileName = urlParts[urlParts.length - 1].split('?')[0];
    if (!fileName) fileName = 'image.jpg';
    const dropboxPath = `${dropboxFolder.replace(/\/$/, '')}/${fileName}`;
    
    // Download the image
    const imageResp = await fetch(imgUrl);
    if (!imageResp.ok) throw new Error(`Failed to download ${imgUrl}`);
    const imageBuffer = await imageResp.buffer();

    // Upload to Dropbox
    await dbx.filesUpload({
      path: dropboxPath,
      contents: imageBuffer,
      mode: 'add',
      autorename: true,
      mute: true
    });

    // Create a shareable link
    const linkMeta = await dbx.sharingCreateSharedLinkWithSettings({ path: dropboxPath });
    const rawLink = linkMeta.result.url.replace('?dl=0', '?raw=1');
    shareLinks.push(rawLink);
  }

  return shareLinks;
}

// Example usage:
// (async () => {
//   const images = [
//     'https://example.com/image1.jpg',
//     'https://example.com/image2.png'
//   ];
//   const folder = '/products/shirts';
//   const token = 'YOUR_DROPBOX_ACCESS_TOKEN';
//   const links = await uploadImagesToDropbox(images, folder, token);
//   console.log(links);
// })();

module.exports = uploadImagesToDropbox;