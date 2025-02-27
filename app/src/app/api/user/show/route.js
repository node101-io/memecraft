import { User } from '../../../../../models/user/User';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const publicKey = searchParams.get('chopin_public_key');
  const telegramId = searchParams.get('telegram_id');

  if (!publicKey && !telegramId)
    return Response.json({ success: false, error: 'User Public Key or Telegram ID is required.' });

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    if (publicKey) {
      User.findUserByPublicKey(publicKey, true, (err, user) => {
        if (err)
        resolve({ success: false, error: err });

        resolve({ success: true, data: user });
      });
    } else {
      console.log('telegramId', telegramId);
      User.findUserByTelegramId(telegramId, (err, user) => {
        console.log('user', user, err);
        if (err)
          resolve({ success: false, error: err });

        resolve({ success: true, data: user });
      });
    };
  }));
};
