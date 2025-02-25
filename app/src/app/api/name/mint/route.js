import { User } from '../../../../../models/user/User';
import { getAddress } from '@chopinframework/next';

import connectDB from '../../../../../lib/db';

export async function POST(req) {
  const body = await req.json();

  const data = {
    buyerPublicKey: getAddress(),
    name: body.name
  };

  await connectDB();

  return Response.json(await new Promise((resolve) => {
    User.purchaseNameByPublicKey(data, (err, name) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: name });
    });
  }));
};
