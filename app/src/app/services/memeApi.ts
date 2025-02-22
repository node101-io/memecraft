export interface Meme {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  owner: string;
}

interface MemeApiResponse {
  memes: Meme[];
  hasMore: boolean;
  total: number;
}

// Mock data
const MOCK_MEMES = Array(300).fill(null).map((_, index) => ({
  id: `meme-${index}`,
  imageUrl: '/memes/meme-1.png',
  title: `Result ${index + 1}`,
  price: '0.11',
  owner: '0x1234...5678'
}));

export class MemeApi {
  static async searchMemes(
    searchTerm: string,
    page: number,
    pageSize: number
  ): Promise<MemeApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredMemes = [...MOCK_MEMES];
    
    if (searchTerm.trim()) {
      filteredMemes = MOCK_MEMES.filter(meme => 
        meme.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedMemes = filteredMemes.slice(start, end);

    return {
      memes: paginatedMemes,
      hasMore: end < filteredMemes.length,
      total: filteredMemes.length
    };
  }

  static async getRecentMemes(
    page: number,
    pageSize: number
  ): Promise<MemeApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedMemes = MOCK_MEMES.slice(start, end);

    return {
      memes: paginatedMemes,
      hasMore: end < MOCK_MEMES.length,
      total: MOCK_MEMES.length
    };
  }

  static async getUsedMemes(
    page: number,
    pageSize: number
  ): Promise<MemeApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For mock data, we'll just reverse the array to simulate different memes
    const reversedMemes = [...MOCK_MEMES].reverse();
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedMemes = reversedMemes.slice(start, end);

    return {
      memes: paginatedMemes,
      hasMore: end < reversedMemes.length,
      total: reversedMemes.length
    };
  }

  static async getAllMemes(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Promise<MemeApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredMemes = [...MOCK_MEMES];
    
    if (searchTerm?.trim()) {
      filteredMemes = MOCK_MEMES.filter(meme => 
        meme.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedMemes = filteredMemes.slice(start, end);

    return {
      memes: paginatedMemes,
      hasMore: end < filteredMemes.length,
      total: filteredMemes.length
    };
  }
}
