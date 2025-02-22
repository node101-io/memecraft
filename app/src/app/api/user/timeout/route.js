import { User } from '../../../../../../app/models/user/User';

export async function POST(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    User.timeOutUserById(body.id, (err) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true });
    });
  }));
};
