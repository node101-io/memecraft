import { User } from '../../../../../../app/models/user/User';

export async function POST(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    User.createMemeForUser(body, (err, meme) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: meme })
    });
  }));
};
