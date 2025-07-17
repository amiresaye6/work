// const sharp = require('sharp');
// const fs = require('fs');

// // Input image file
// const inputImage = 'image.jpg'; // Change this to your image filename

// // Output file names
// const outputNoBg = 'output_no_bg.png'; // Placeholder, see below
// const outputWebp = 'output.webp';
// const outputWithBg = 'output_with_bg.png';
// const outputResized = 'output_resized.png';

// // ----- 1. Remove background (requires external API or tool) -----
// // Sharp can't remove background by itself. 
// // You can use remove.bg API or similar service, or run a local segmentation tool.
// // For now, this is a placeholder function.
// async function removeBackground(input, output) {
//     // Placeholder: Copy original image
//     fs.copyFileSync(input, output);
//     console.log('(Placeholder) Background removal not performed: copied original image.');
// }

// // ----- 2. Convert to WebP -----
// async function convertToWebp(input, output) {
//     await sharp(input)
//         .webp({ quality: 90 })
//         .toFile(output);
//     console.log('Converted to WebP:', output);
// }

// // ----- 3. Add different background -----
// async function addBackground(input, output, bgColor = '#00ff00') {
//     // Extract alpha channel, flatten with new background
//     await sharp(input)
//         .flatten({ background: bgColor }) // Removes transparency and adds background
//         .toFile(output);
//     console.log('Added new background:', output);
// }

// // ----- 4. Resize to different dimensions -----
// async function resizeImage(input, output, width = 400, height = 400) {
//     await sharp(input)
//         .resize(width, height)
//         .toFile(output);
//     console.log(`Resized image to ${width}x${height}:`, output);
// }

// // ----- Main script -----
// async function processAll() {
//     // 1. Remove background (placeholder)
//     await removeBackground(inputImage, outputNoBg);

//     // 2. Convert to WebP
//     await convertToWebp(inputImage, outputWebp);

//     // 3. Add different background color (using the "no background" image)
//     await addBackground(outputNoBg, outputWithBg, '#ffcccc'); // light pink

//     // 4. Resize
//     await resizeImage(inputImage, outputResized, 300, 200);
// }

// processAll().catch(console.error);


const sharp = require('sharp');
const fs = require('fs');

// INPUT
const inputImage = 'image.jpg'; // Change if your input image has a different name

// OUTPUT
const outputImage = 'output_resized_centered_bg.png';

// CONFIG
const bgColor = { r: 173, g: 216, b: 230, alpha: 1 }; // Light blue: #ADD8E6
const outputWidth = 0; // Let code compute based on input
const outputHeight = 0; // Let code compute based on input

async function processImage() {
    // Read metadata
    const metadata = await sharp(inputImage).metadata();

    // Compute new (smaller) size
    const scale = 0.8; // 80% of original size (20% smaller)
    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);

    // Create a background canvas same as original size
    const bg = sharp({
        create: {
            width: metadata.width,
            height: metadata.height,
            channels: 4,
            background: bgColor
        }
    });

    // Resize the image
    const resized = await sharp(inputImage)
        .resize(newWidth, newHeight)
        .toBuffer();

    // Calculate top/left offset to center resized image
    const left = Math.round((metadata.width - newWidth) / 2);
    const top = Math.round((metadata.height - newHeight) / 2);

    // Composite resized image onto background
    await bg
        .composite([{ input: resized, left, top }])
        .png()
        .toFile(outputImage);

    console.log(`Done! Output at: ${outputImage}
- New size: ${newWidth} x ${newHeight}
- Centered on light blue background (${metadata.width} x ${metadata.height})`);
}

processImage().catch(console.error);