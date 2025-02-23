import { Meme } from '../../../../../models/meme/Meme';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const memeId = searchParams.get('meme_id');

  if (!memeId)
    return Response.json({ success: false, error: 'User Public Key is required.' });

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    Meme.findMemeById(memeId, (err, meme) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: meme });
    });
  }));
};
