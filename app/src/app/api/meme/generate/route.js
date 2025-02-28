import { Client } from '../../../services/api';
import { User } from '../../../../../models/user/User';
import { getAddress } from '@chopinframework/next';

const FREE_GENERATIONS_PER_DAY = 5;
const PAID_GENERATION_COST = 0.5;

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, templateId, mode, freeGenerationsLeft } = body;
    const chopin_public_key = await getAddress();

    if (!prompt || !chopin_public_key)
      return Response.json({ 
        success: false, 
        error: 'Missing required fields.' 
      });

    if (freeGenerationsLeft <= 0) {
      const deductResult = await new Promise((resolve) => {
        User.deductBalance(chopin_public_key, PAID_GENERATION_COST, (err) => {
          if (err) {
            if (err === 'insufficient_balance') {
              resolve('Insufficient balance');
            } else {
              resolve('Failed to process payment');
            }
          }
          resolve(null);
        });
      });

      if (deductResult) {
        return Response.json({ 
          success: false, 
          error: deductResult 
        });
      }
    }

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