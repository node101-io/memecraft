import { Oracle } from '@chopinframework/next';

import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';
import { createPinataFormData } from '../../../../../utils/createPinataFormData';

const DEFAULT_MEME_MINT_PRICE = 0.1;
const PIN_FILE_TO_IPFS_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function POST(req) {
  const body = await req.json();

  if (!body.file)
    return Response.json({ success: false, error: 'Meme is not provided.' });

  if (!body.file.startsWith('data:image/png;base64,'))
    return Response.json({ success: false, error: 'Invalid image format. Only PNG files are supported.' });

  const data = {
    chopin_public_key: body.chopin_public_key,
    dateNow: await Oracle.now(),
    memeData: {
      content_url: body.content_url,
      description: body.memeData.description,
      mint_price: body.mint_price || DEFAULT_MEME_MINT_PRICE
    }
  };

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.checkIfUserIsTimedOut(data, async (err, isTimedOut) => {
      if (err)
        resolve({ success: false, error: err });

      if (isTimedOut)
        resolve({ success: false, error: 'User is timed out.' });

      // TODO: Desc and tags. Is harmful to the user. It is mocked.
      const aiResponse = {
        is_harmful_content: false,
        tags: [ 'frog', 'doge', 'meme', 'musk' ],
        description: 'Doge ate Musk. Frog is watching.'
      };

      if (aiResponse.is_harmful_content)
        return User.timeoutUserByPublicKey(data, (err) => {
          if (err)
            resolve({ success: false, error: err });

          resolve({ success: false, error: 'Meme contains harmful content. You have been timed out for 24 hours.' });
        });

      data.memeData.tags = aiResponse.tags;
      data.memeData.description = aiResponse.description;

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

      User.createMemeForUser(data, (err, meme) => {
        if (err)
          resolve({ success: false, error: err });

        resolve({ success: true, data: meme })
      });
    });
  }));
};
