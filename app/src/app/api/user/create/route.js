import { User } from '../../../../../../backend/models/user/User';

export async function POST(req) {
  const body = await req.json();

  User.createUser(body, (err, user) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: user });
  });
};
