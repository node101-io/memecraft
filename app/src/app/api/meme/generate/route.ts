import { ImgflipClient } from '../../../services/imgflipApi';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, templateId } = body;

    if (!prompt) {
      return Response.json({ 
        success: false, 
        error: 'Prompt is required for meme generation.' 
      });
    }

    const imgflipClient = new ImgflipClient({
      username: process.env.IMGFLIP_USERNAME || '',
      password: process.env.IMGFLIP_PASSWORD || '',
    });

    try {
      const meme = await imgflipClient.generateMeme(prompt);

      // TODO: Store meme in database or IPFS if needed
      // You can adapt the IPFS upload logic from the original route.js here
      // For example:
      // const base64Data = await fetch(meme.imageUrl).then(r => r.buffer());
      // ... IPFS upload logic ...

      return Response.json({
        success: true,
        data: {
          id: meme.id,
          imageUrl: meme.imageUrl,
          pageUrl: meme.pageUrl,
          title: meme.title,
          texts: meme.texts,
          price: meme.price,
          owner: meme.owner,
        }
      });

    } catch (error) {
      console.error('Imgflip API error:', error);
      return Response.json({ 
        success: false, 
        error: 'Failed to generate meme with Imgflip API' 
      });
    }

  } catch (error) {
    console.error('Route error:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 