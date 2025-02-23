import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../../app/lib/db';

export async function POST(req) {
  const body = await req.json();

  const data = {
    chopin_public_key: body.chopin_public_key,
    telegram_id: body.telegram_id
  };

  await connectDB();

  return Response.json(await new Promise((resolve, reject) => {
    User.createUser(data, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
