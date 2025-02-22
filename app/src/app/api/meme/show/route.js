import { Meme } from '../../../../../../app/models/meme/Meme';

export async function GET(req) {
  const body = await req.json();

  Meme.findMemeById(body.id, (err, user) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: user });
  });
};
