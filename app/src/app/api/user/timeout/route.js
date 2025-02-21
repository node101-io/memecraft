import { User } from '../../../../../../backend/models/user/User';

export async function POST(req) {
  const body = await req.json();

  User.timeOutUserById(body.id, (err) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true });
  });
};
