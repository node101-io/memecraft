import { User } from '../../../../../../backend/models/user/User';

export async function POST(req) {
  const body = await req.json();

  User.createMemeForUser(body.id, body.memeData, (err, meme) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: meme });
  });
};
