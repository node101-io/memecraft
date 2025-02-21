import { Meme } from '../../../../../../app/models/meme/Meme';

export async function GET(req) {
  const body = await req.json();

  Meme.findMemesByFilters(body, (err, meme) => {
    if (err)
      return new Response({ success: false, error: err });

    return new Response({ success: true, data: meme });
  });
};
