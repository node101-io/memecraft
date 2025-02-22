import { User } from '../../../../../models/user/User';

export async function GET(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    User.findUserById(body.id, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
