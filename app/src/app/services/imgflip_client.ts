// Add import for node-fetch if not in browser environment
import 'isomorphic-fetch';

interface ImgflipCredentials {
  username: string;
  password: string;
}

interface AIMemeRequest {
  model?: 'openai' | 'classic';
  template_id?: number;
  prefix_text?: string;
  no_watermark?: boolean;
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

export class ImgflipClient {
  private readonly API_URL = 'https://api.imgflip.com/ai_meme';
  private credentials: ImgflipCredentials;

  constructor(credentials: ImgflipCredentials) {
    this.credentials = credentials;
  }

  async generateAIMeme(options: AIMemeRequest = {}): Promise<AIMemeResponse> {
    const requestBody = {
      ...this.credentials,
      ...options,
    };

    // Convert all values to strings and filter out undefined values
    const formData = new URLSearchParams();
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    try {
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
      if (error instanceof Error) {
        throw new Error(`Imgflip API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while generating meme');
    }
  }

  async generateMeme(prefix?: string): Promise<Meme> {
    const response = await this.generateOpenAIMeme(prefix);
    return {
      id: String(response.data.template_id),
      imageUrl: response.data.url,
      pageUrl: response.data.page_url,
      title: prefix || 'Generated Meme',
      texts: response.data.texts,
      price: '0.11', // Mock price
      owner: '0x1234...5678', // Mock owner
    };
  }

  /**
   * Helper method to generate a meme with OpenAI model
   */
  async generateOpenAIMeme(prefix?: string, templateId?: number): Promise<AIMemeResponse> {
    return this.generateAIMeme({
      model: 'openai',
      prefix_text: prefix,
      template_id: templateId,
    });
  }

  /**
   * Helper method to generate a meme with Classic model
   */
  async generateClassicMeme(prefix?: string, templateId?: number): Promise<AIMemeResponse> {
    return this.generateAIMeme({
      model: 'classic',
      prefix_text: prefix,
      template_id: templateId,
    });
  }
}

// Example usage:
/*
const client = new ImgflipClient({
  username: 'your_username',
  password: 'your_password',
});

// Generate a meme with OpenAI model
const meme = await client.generateOpenAIMeme('cats');

// Or use the general method with more options
const customMeme = await client.generateAIMeme({
  model: 'openai',
  prefix_text: 'programming',
  template_id: 123456,
  no_watermark: true,
});
*/ 