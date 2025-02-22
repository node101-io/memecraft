import { User } from '../../../../../models/user/User';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id)
    return Response.json({ success: false, error: 'User ID is required.' });

  return Response.json(await new Promise((resolve, reject) => {
    User.findUserById(id, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
