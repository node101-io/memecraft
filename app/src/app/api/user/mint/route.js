import { User } from '../../../../../../app/models/user/User';

import connectDB from '../../../../../lib/db';

export async function POST(req) {
  const body = await req.json();

  const data = {
    buyerPublicKey: body.buyerPublicKey,
    memeId: body.memeId
  };

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.purchaseMemeById(data, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
