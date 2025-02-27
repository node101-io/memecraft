import { Oracle } from '@chopinframework/next';

import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get('telegram_id');
  const memeId = searchParams.get('meme_id');

  const data = {
    telegram_id: telegramId,
    meme_id: memeId,
    dateNow: await Oracle.now()
  };

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.findMemeByIdAndMarkAsUsed(data, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
