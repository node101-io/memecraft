import { User } from '../../../../../../backend/models/user/User';

export async function GET(req) {
  const body = await req.json();

  User.findUserById(body.id, (err, user) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: user });
  });
};
