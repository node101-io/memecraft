import { User } from '../../../../../../app/models/user/User';

export async function GET(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    User.findLastUsedMemesById(body.id, (err, lastUsedMemes) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: lastUsedMemes });
    });
  }));
};
