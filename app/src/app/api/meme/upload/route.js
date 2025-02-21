import axios from 'axios';
import FormData from 'form-data';

import { User } from '../../../../../../app/models/user/User';

const PIN_FILE_TO_IPFS_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.file)
      return new Response({ success: false, error: 'Meme is not provided.' }, { status: 400 });

    const formData = new FormData();

    const memeBuffer = Buffer.from(body.file, 'base64');
    formData.append('file', memeBuffer, { filename: body.memeData.description || 'meme.png' });

    const axiosResponse = await axios.post(
      PIN_FILE_TO_IPFS_URL,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    const ipfsHash = axiosResponse.data.IpfsHash;

    body.memeData.content_url = ipfsHash;

    User.createMemeForUser(body.id, body.memeData, (err, meme) => {
      if (err)
        return new Response({ success: false, error: err });

      return new Response({ success: true, data: meme });
    });
  } catch (error) {
    return new Response({ success: false, error: error.message });
  }
}
