import { Oracle, getAddress } from '@chopinframework/next';

import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';
import { createPinataFormData } from '../../../../../utils/createPinataFormData';

const DEFAULT_MEME_MINT_PRICE = 0.1;
const PIN_FILE_TO_IPFS_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function POST(req) {
  const body = await req.json();

  if (body.file && !body.file.startsWith('data:image/png;base64,'))
    return Response.json({ success: false, error: 'Invalid image format. Only PNG files are supported.' });

  const data = {
    chopin_public_key: await getAddress(),
    dateNow: await Oracle.now(),
    memeData: {
      content_url: body.content_url,
      description: body.description,
      mint_price: body.mint_price || DEFAULT_MEME_MINT_PRICE,
      tags: body.description.split(' ')
    }
  };

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.checkIfUserIsTimedOut(data, async (err, isTimedOut) => {
      if (err)
        resolve({ success: false, error: err });

      if (isTimedOut)
        resolve({ success: false, error: 'User is timed out.' });

      if (body.is_harmful_content)
        return User.timeoutUserByPublicKey(data, (err) => {
          if (err)
            resolve({ success: false, error: err });

          resolve({ success: false, error: 'Meme contains harmful content. You have been timed out for 24 hours.' });
        });

      if (body.file) {
        const { boundary, formBody } = await createPinataFormData(body.file);

        // TODO: Use Oracle.fetch() instead
        const pinataResponse = await fetch(PIN_FILE_TO_IPFS_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Accept': 'application/json'
          },
          body: formBody
        });

        if (!pinataResponse.ok)
          resolve({ success: false, error: await pinataResponse.json() });

        const pinataData = await pinataResponse.json();

        if (data.memeData && !data.memeData.content_url)
          data.memeData.content_url = `https://ipfs.io/ipfs/${pinataData.IpfsHash}`;
      };

      User.createMemeForUser(data, (err, meme) => {
        if (err)
          resolve({ success: false, error: err });

        resolve({ success: true, data: meme })
      });
    });
  }));
};
