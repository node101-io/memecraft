import { User } from '../../../../../models/user/User';

import connectDB from '../../../../../lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const publicKey = searchParams.get('chopin_public_key');

  if (!publicKey)
    return Response.json({ success: false, error: 'User Public Key is required.' });

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.findUserByPublicKey(publicKey, true, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
