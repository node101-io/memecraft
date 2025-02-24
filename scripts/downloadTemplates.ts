import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import sharp from 'sharp';

interface Template {
    ID: string;
    Name: string;
    Tags: string;
}

async function downloadImage(url: string, filepath: string, tags: string) {
    try {
        console.log(`Attempting to download from URL: ${url}`);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // Process tags
        const tagList = tags.replace(/(^"|"$)/g, '').split(',').map(tag => tag.trim());
        
        // Use sharp to save the image with metadata
        await sharp(response.data)
            .withMetadata()
            .jpeg({
                quality: 100,
                chromaSubsampling: '4:4:4',
                force: true
            })
            .toBuffer()
            .then(buffer => {
                // Create a new sharp instance with the processed buffer
                return sharp(buffer)
                    .withMetadata({
                        exif: {
                            IFD0: {
                                ImageDescription: tags,
                                XPKeywords: tagList.join(';')
                            }
                        }
                    })
                    .toFile(filepath);
            });

        console.log(`Successfully downloaded: ${filepath}`);
        console.log(`Added tags: ${tagList.join(', ')}`);
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
    }
}

async function main() {
    // Create static directory if it doesn't exist
    const staticDir = path.join(process.cwd(), 'static');
    if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir);
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync(path.join(process.cwd(), 'scripts', 'templates.csv'), 'utf-8');
    const templates = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    }) as Template[];

    // Process each template
    for (const template of templates) {
        // Convert template name to URL format while preserving capitalization
        const urlName = template.Name
            .replace(/['']/g, '') // Remove special quotes
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-'); // Replace spaces with hyphens

        const imageUrl = `https://imgflip.com/s/meme/${urlName}.jpg`;
        const outputPath = path.join(staticDir, `${template.ID}.jpg`);

        console.log(`Downloading ${template.Name}...`);
        await downloadImage(imageUrl, outputPath, template.Tags);
        
        // Add a small delay between requests to be nice to the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

main().catch(console.error);
