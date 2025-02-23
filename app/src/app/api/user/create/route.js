import { User } from '../../../../../../app/models/user/User';
import { getAddress } from '@chopinframework/next';

import connectDB from '../../../../../../app/lib/db';

export async function POST(req) {
  const body = await req.json();

  const data = {
    chopin_public_key: await getAddress(),
    telegram_id: body.telegram_id
  };

  await connectDB();

  return Response.json(await new Promise((resolve, reject) => {
    User.createUserIfNotExists(data, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
