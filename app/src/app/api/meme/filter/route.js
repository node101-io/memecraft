import { Meme } from '../../../../../../app/models/meme/Meme';
import connectDB from '../../../../../../app/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const filters = {
    // creator: searchParams.get('creator'),
    tags: searchParams.get('tags')?.split(',').filter(Boolean),
    description: searchParams.get('description'),
    skip: parseInt(searchParams.get('skip')) || 0,
    limit: parseInt(searchParams.get('limit')) || 10
  };

  await connectDB();

  return Response.json(await new Promise((resolve, reject) => {
    Meme.findMemesByFilters(filters, (err, memes) => {
      if (err)
        resolve({ success: false, error: err });

      resolve({ success: true, data: memes });
    });
  }));
};
