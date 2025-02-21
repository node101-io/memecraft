import { User } from '../../../../../../backend/models/user/User';

export async function GET(req) {
  const body = await req.json();

  User.findLastUsedMemesById(body.id, (err, lastUsedMemes) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: lastUsedMemes });
  });
};
