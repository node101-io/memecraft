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

export class ImgflipAIApi {
  private readonly API_URL = 'https://api.imgflip.com/ai_meme';
  private credentials: ImgflipCredentials;

  constructor(credentials: ImgflipCredentials) {
    this.credentials = credentials;
  }

  // ... rest of the class implementation stays the same ...
} 