import { Oracle } from '@chopinframework/next';

import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const publicKey = searchParams.get('chopin_public_key');
  const memeId = searchParams.get('meme_id');

  const data = {
    chopin_public_key: publicKey,
    memeId: memeId,
    dateNow: await Oracle.now()
  };

  console.log(data);

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.findMemeByIdAndMarkAsUsed(data, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
