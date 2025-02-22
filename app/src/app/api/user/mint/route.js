import { User } from '../../../../../../app/models/user/User';
import { Oracle } from '@chopinframework/next';

export async function POST(req) {
  const body = await req.json();

  const data = {
    buyerId: body.buyerId,
    memeId: body.memeId,
    dateNow: await Oracle.now()
  };

  return Response.json(await new Promise((resolve, reject) => {
    User.purchaseMemeById(data, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
