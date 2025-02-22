import { Meme } from '../../../../../../app/models/meme/Meme';

export async function GET(req) {
  const body = await req.json();

  return new Response(await new Promise((resolve, reject) => {
    Meme.findMemesByFilters(body, (err, meme) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: meme });
    });
  }));
};
