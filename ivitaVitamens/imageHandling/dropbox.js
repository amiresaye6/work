require('dotenv').config();
const fs = require('fs');
const { Dropbox } = require('dropbox');

// For Node 18+, fetch is global.
// If not, you would need node-fetch@2 or a dynamic import.
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch,
});

/**
 * Create a folder at the specified path within your app folder.
 * @param {string} folderPath - Dropbox path (e.g. "/myfolder").
 */
async function createFolder(folderPath) {
  try {
    await dbx.filesCreateFolderV2({ path: folderPath, autorename: false });
    // console.log(`Folder created: ${folderPath}`);
  } catch (err) {
    if (err?.error?.error_summary?.includes('path/conflict/folder')) {
      // console.log(`Folder already exists: ${folderPath}`);
    } else {
      throw err;
    }
  }
}

/**
 * Upload a file to a specified path in your Dropbox app folder.
 * @param {string} localPath - Path to the local file.
 * @param {string} dropboxSavePath - Path within your app folder to save the file (e.g. "/somefolder/file.txt").
 * @returns {Promise<Object>} Dropbox file metadata.
 */
async function uploadFile(localPath, dropboxSavePath) {
  try {
    const contents = fs.readFileSync(localPath);
    const response = await dbx.filesUpload({
      path: dropboxSavePath,
      contents,
      mode: 'overwrite',
      autorename: false,
      mute: false,
    });
    return response.result;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

/**
 * Create a shared link for a file or folder.
 * @param {string} path - Dropbox path (e.g. "/myfolder/file.txt").
 * @returns {Promise<string>} The shared link.
 */
async function createSharedLink(path) {
  try {
    const res = await dbx.sharingCreateSharedLinkWithSettings({ path });
    return res.result.url;
  } catch (err) {
    // If already shared, get the existing link
    if (err?.error?.error?.shared_link_already_exists) {
      const res = await dbx.sharingListSharedLinks({ path, direct_only: true });
      if (res.result.links.length > 0) return res.result.links[0].url;
    }
    throw err;
  }
}

module.exports = {
  createFolder,
  uploadFile,
  createSharedLink,
};