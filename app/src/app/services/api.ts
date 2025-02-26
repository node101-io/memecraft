import { Oracle } from '@chopinframework/next';

interface ImgflipCredentials {
  username: string;
  password: string;
}

interface AIMemeRequest {
  template_id?: number;
  prefix_text?: string;
}

interface AIMemeResponse {
  success: boolean;
  data: {
    url: string;
    page_url: string;
    template_id: number;
    texts: string[];
  };
  error_message?: string;
}

export interface Meme {
  id: string;
  imageUrl: string;
  pageUrl: string;
  title: string;
  texts: string[];
  price: string;
  owner: string;
}

export class Client {
  private readonly API_URL = 'https://api.imgflip.com/ai_meme';
  private credentials: ImgflipCredentials;

  constructor(credentials: ImgflipCredentials) {
    this.credentials = credentials;
  }

  async generateAIMeme(options: AIMemeRequest = {}): Promise<AIMemeResponse> {
    try {
      const formData = new URLSearchParams();
      const requestBody = {
        username: this.credentials.username,
        password: this.credentials.password,
        no_watermark: true,
        model: 'openai',
        ...options
      };

      // Convert all values to strings
      Object.entries(requestBody).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error_message || 'Failed to generate meme');
      }

      return data;
    } catch (error) {
      console.error('Imgflip API error:', error);

      if (error instanceof Error)
        throw new Error(`Imgflip API error: ${error.message}`);

      throw new Error('Unknown error occurred while generating meme');
    }
  }

  async generateMeme(prompt: string, templateId?: number): Promise<{ content_url: string, description: string }> {
    const response = await this.generateAIMeme({
      prefix_text: prompt,
      template_id: templateId,
    });
  
    return {
      content_url: response.data.url,
      description: response.data.texts.join(' ')
    };
  }
}
