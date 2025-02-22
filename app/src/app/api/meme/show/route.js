import { reject } from 'async';
import { Meme } from '../../../../../../app/models/meme/Meme';

export async function GET(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    Meme.findMemeById(body.id, (err, user) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: user });
    });
  }));
};
