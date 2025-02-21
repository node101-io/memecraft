import { User } from '../../../../../../app/models/user/User';

export async function POST(req) {
  const body = await req.json();

  User.purchaseMemeById(body.id, body.memeId, (err) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true });
  });
};
