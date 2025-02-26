import { Client } from '../../../services/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, templateId, mode } = body;

    if (!prompt)
      return Response.json({ 
        success: false, 
        error: 'Prompt is required for meme generation.' 
      });

    const client = new Client({
      username: process.env.IMGFLIP_USERNAME || '',
      password: process.env.IMGFLIP_PASSWORD || '',
    });

    try {
      const { content_url, description } = await client.generateMeme(prompt, mode === 'template' ? Number(templateId) : undefined);

      return Response.json({
        success: true,
        data: {
          content_url,
          description
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