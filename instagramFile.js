const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const fetch = require('node-fetch');
const fs = require('fs');

const url = "https://saveig.app/api/ajaxSearch";
// const fileUrl = "https://www.instagram.com/reel/C9_1jwfRRaY/?igsh=cnQ0MTg4aDd1cWVw"; // video
const fileUrl = "https://www.instagram.com/p/C5nBPT_xUcf/?igsh=dzVvNmJiM3AwZWkw"; // image


const downloadFile = async (fileUrl, filename) => {
    const response = await fetch(fileUrl);
    const totalBytes = parseInt(response.headers.get('content-length'), 10);
    let downloadedBytes = 0;

    if (totalBytes) {
        const fileStream = fs.createWriteStream(filename);
        const responseStream = response.body;

        responseStream.on('data', chunk => {
            downloadedBytes += chunk.length;
            const percentage = (downloadedBytes / totalBytes) * 100;
            console.log(`Downloading ${filename}: ${percentage.toFixed(2)}%`);
        });

        responseStream.pipe(fileStream);

        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                console.log(`Downloaded ${filename}`);
                resolve();
            });
            fileStream.on('error', reject);
        });
    } else {
        console.log(`File size unknown, downloading ${filename}`);
        const buffer = await response.buffer();
        fs.writeFile(filename, buffer, () => 
          console.log(`Downloaded ${filename}`));
    }
};

const getFile = async () => {
    const data = {
        q: fileUrl,
        t: "media",
        lang: "en"
    };

    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://saveig.app',
        'Priority': 'u=1, i',
        'Referer': 'https://saveig.app/',
        'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'Sec-CH-UA-Mobile': '?1',
        'Sec-CH-UA-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
    };

    try {
        const response = await axios.post(url, qs.stringify(data), { headers });
        const responseData = response.data;
        const $ = cheerio.load(responseData.data);

        const downloadLinks = [];

        // Extract video download links
        $('.download-items__btn a').each((index, element) => {
            const href = $(element).attr('href');
            if (href) {
                downloadLinks.push(href);
            }
        });

        // Extract image download links (if available)
        $('img').each((index, element) => {
            const src = $(element).attr('src');
            if (src && src.includes('cdninstagram.com')) {
                downloadLinks.push(src);
            }
        });

        downloadLinks.forEach((link, index) => {
            const extension = link.includes('.jpg') || link.includes('.png') ? '.jpg' : '.mp4';
            const filename = `downloaded_file_${index + 1}${extension}`;
            downloadFile(link, filename);
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

getFile();
