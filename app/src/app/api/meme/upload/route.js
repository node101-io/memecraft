import crypto from 'crypto';

import { User } from '../../../../../../app/models/user/User';

const PIN_FILE_TO_IPFS_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.file) {
      return new Response(
        JSON.stringify({ success: false, error: 'Meme is not provided.' }),
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(body.file, 'base64');

    const randomName = crypto.randomBytes(8).toString('hex');
    const fileName = `${randomName}.png`;

    const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

    const formParts = [];

    formParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    );
    formParts.push(fileBuffer);
    formParts.push('\r\n');

    formParts.push(
      `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="pinataMetadata"\r\n\r\n' +
      JSON.stringify({ name: fileName }) +
      '\r\n'
    );

    formParts.push(
      `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="pinataOptions"\r\n\r\n' +
      JSON.stringify({ cidVersion: 1 }) +
      '\r\n'
    );

    formParts.push(`--${boundary}--\r\n`);

    const formBody = Buffer.concat(
      formParts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
    );

    const jwtToken = process.env.PINATA_JWT;

    const response = await fetch(PIN_FILE_TO_IPFS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formBody.length.toString()
      },
      body: formBody
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response({ success: false, error: errorData });
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    body.memeData.content_url = ipfsHash;

    return new Promise((resolve) => {
      User.createMemeForUser(body.id, body.memeData, (err, meme) => {
        if (err)
          resolve(new Response({ success: false, error: err }));
        else
          resolve(new Response({ success: true, data: meme }));
      });
    });
  } catch (error) {
    return new Response({ success: false, error: error.message });
  }
}
