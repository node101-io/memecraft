import crypto from 'crypto';
import { Oracle } from '@chopinframework/next';

import { User } from '../../../../../../app/models/user/User';

const PIN_FILE_TO_IPFS_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export async function POST(req) {
  // user banlı mı kontrol edilecek
  // ilk önce ai'a atılacak, description ve tagler üretilecek, content uygunsuz olursa timeout user fonku çağırılacak
  // ipfs'ten content url alınacak
  // create meme fonksiyonu çağırılacak

  // TODO: organize and check user before uploading meme

  try {
    const body = await req.json();

    if (!body.file)
      return Response.json({ success: false, error: 'Meme is not provided.' });

    if (!body.file.startsWith('data:image/png;base64,'))
      return Response.json({ success: false, error: 'Invalid image format. Only PNG files are supported.' });

    const base64Data = body.file.replace(/^data:image\/png;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    const randomName = crypto.randomBytes(8).toString('hex');
    const fileName = `${randomName}.png`;

    const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

    const formParts = [];

    formParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    );
    formParts.push(fileBuffer);
    formParts.push('\r\n');

    formParts.push(
      `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="pinataMetadata"\r\n\r\n' +
      JSON.stringify({
        name: fileName,
        keyvalues: {
          type: 'image/png'
        }
      }) +
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

    // TODO: Use Oracle.fetch() instead
    const response = await fetch(PIN_FILE_TO_IPFS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Accept': 'application/json'
      },
      body: formBody
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json({ success: false, error: errorData });
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    body.memeData.content_url = ipfsHash;

    console.log(ipfsHash);

    return Response.json(await new Promise((resolve) => {
      User.createMemeForUser(data, (err, meme) => {
        if (err)
          resolve({ success: false, error: err });

        resolve({ success: true, data: meme })
      });
    }));
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
