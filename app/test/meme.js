import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { Meme } from '../models/meme/Meme.js';

// Mock mongoose methods
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    models: {
      Meme: null
    },
    model: vi.fn().mockImplementation((modelName, schema) => {
      if (modelName === 'Meme') {
        return {
          findById: vi.fn(),
          findOneAndDelete: vi.fn(),
          find: vi.fn(),
          populate: vi.fn(),
          sort: vi.fn(),
          skip: vi.fn(),
          limit: vi.fn()
        };
      }
      return {};
    })
  };
});

describe('Meme Model', () => {
  let mockMeme;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'test_user',
      chopin_public_key: 'test_public_key'
    };

    mockMeme = {
      _id: new mongoose.Types.ObjectId(),
      creator: mockUser._id,
      description: 'Test meme',
      tags: ['test', 'meme'],
      content_url: 'https://example.com/meme.jpg',
      mint_price: 10,
      toObject: vi.fn().mockReturnValue({
        _id: mockMeme?._id,
        creator: mockUser,
        description: 'Test meme',
        tags: ['test', 'meme'],
        content_url: 'https://example.com/meme.jpg',
        mint_price: 10
      })
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findMemeById', () => {
    it('should find a meme by id', async () => {
      // Setup
      Meme.findById = vi.fn().mockReturnValue({
        then: vi.fn().mockImplementation(callback => {
          callback(mockMeme);
          return {
            catch: vi.fn().mockImplementation(callback => {
              // Not called in this test
            })
          };
        })
      });

      // Execute
      await new Promise(resolve => {
        Meme.findMemeById(mockMeme._id, (err, meme) => {
          // Assert
          expect(err).toBeNull();
          expect(meme).toEqual(mockMeme);
          expect(Meme.findById).toHaveBeenCalledWith(mockMeme._id);
          resolve();
        });
      });
    });

    it('should return document_not_found if meme does not exist', async () => {
      // Setup
      Meme.findById = vi.fn().mockReturnValue({
        then: vi.fn().mockImplementation(callback => {
          callback(null);
          return {
            catch: vi.fn()
          };
        })
      });

      // Execute
      await new Promise(resolve => {
        Meme.findMemeById(mockMeme._id, (err) => {
          // Assert
          expect(err).toBe('document_not_found');
          resolve();
        });
      });
    });

    it('should return bad_request if id is invalid', async () => {
      // Execute
      await new Promise(resolve => {
        Meme.findMemeById('invalid_id', (err) => {
          // Assert
          expect(err).toBe('bad_request');
          resolve();
        });
      });
    });

    it('should handle database errors', async () => {
      // Setup
      Meme.findById = vi.fn().mockReturnValue({
        then: vi.fn().mockImplementation(() => {
          return {
            catch: vi.fn().mockImplementation(callback => {
              callback(new Error('Database error'));
            })
          };
        })
      });

      // Execute
      await new Promise(resolve => {
        Meme.findMemeById(mockMeme._id, (err) => {
          // Assert
          expect(err).toBe('database_error');
          resolve();
        });
      });
    });
  });

  describe('findMemesByFilters', () => {
    it('should find memes by creator', async () => {
      // Setup
      const findMock = vi.fn().mockReturnThis();
      const populateMock = vi.fn().mockReturnThis();
      const sortMock = vi.fn().mockReturnThis();
      const skipMock = vi.fn().mockReturnThis();
      const limitMock = vi.fn().mockReturnThis();
      const thenMock = vi.fn().mockImplementation(callback => {
        callback([mockMeme]);
        return { catch: vi.fn() };
      });
      
      Meme.find = findMock;
      findMock.mockReturnValue({ populate: populateMock });
      populateMock.mockReturnValue({ sort: sortMock });
      sortMock.mockReturnValue({ skip: skipMock });
      skipMock.mockReturnValue({ limit: limitMock });
      limitMock.mockReturnValue({ then: thenMock });

      // Execute
      await new Promise(resolve => {
        Meme.findMemesByFilters({ creator: mockUser._id }, (err, memes) => {
          // Assert
          expect(err).toBeNull();
          expect(memes.length).toBe(1);
          expect(findMock).toHaveBeenCalledWith({ $and: [{ creator: mockUser._id }] });
          resolve();
        });
      });
    });

    it('should find memes by tags', async () => {
      // Setup
      const findMock = vi.fn().mockReturnThis();
      const populateMock = vi.fn().mockReturnThis();
      const sortMock = vi.fn().mockReturnThis();
      const skipMock = vi.fn().mockReturnThis();
      const limitMock = vi.fn().mockReturnThis();
      const thenMock = vi.fn().mockImplementation(callback => {
        callback([mockMeme]);
        return { catch: vi.fn() };
      });
      
      Meme.find = findMock;
      findMock.mockReturnValue({ populate: populateMock });
      populateMock.mockReturnValue({ sort: sortMock });
      sortMock.mockReturnValue({ skip: skipMock });
      skipMock.mockReturnValue({ limit: limitMock });
      limitMock.mockReturnValue({ then: thenMock });

      // Execute
      await new Promise(resolve => {
        Meme.findMemesByFilters({ tags: ['test'] }, (err, memes) => {
          // Assert
          expect(err).toBeNull();
          expect(memes.length).toBe(1);
          expect(findMock).toHaveBeenCalledWith({ $and: [{ tags: { $in: ['test'] } }] });
          resolve();
        });
      });
    });

    it('should find memes by description', async () => {
      // Setup
      const findMock = vi.fn().mockReturnThis();
      const populateMock = vi.fn().mockReturnThis();
      const sortMock = vi.fn().mockReturnThis();
      const skipMock = vi.fn().mockReturnThis();
      const limitMock = vi.fn().mockReturnThis();
      const thenMock = vi.fn().mockImplementation(callback => {
        callback([mockMeme]);
        return { catch: vi.fn() };
      });
      
      Meme.find = findMock;
      findMock.mockReturnValue({ populate: populateMock });
      populateMock.mockReturnValue({ sort: sortMock });
      sortMock.mockReturnValue({ skip: skipMock });
      skipMock.mockReturnValue({ limit: limitMock });
      limitMock.mockReturnValue({ then: thenMock });

      // Execute
      await new Promise(resolve => {
        Meme.findMemesByFilters({ description: 'test' }, (err, memes) => {
          // Assert
          expect(err).toBeNull();
          expect(memes.length).toBe(1);
          expect(findMock).toHaveBeenCalledWith({ 
            $and: [{ description: { $regex: 'test', $options: 'i' } }] 
          });
          resolve();
        });
      });
    });

    it('should handle pagination with skip and limit', async () => {
      // Setup
      const findMock = vi.fn().mockReturnThis();
      const populateMock = vi.fn().mockReturnThis();
      const sortMock = vi.fn().mockReturnThis();
      const skipMock = vi.fn().mockReturnThis();
      const limitMock = vi.fn().mockReturnThis();
      const thenMock = vi.fn().mockImplementation(callback => {
        callback([mockMeme]);
        return { catch: vi.fn() };
      });
      
      Meme.find = findMock;
      findMock.mockReturnValue({ populate: populateMock });
      populateMock.mockReturnValue({ sort: sortMock });
      sortMock.mockReturnValue({ skip: skipMock });
      skipMock.mockReturnValue({ limit: limitMock });
      limitMock.mockReturnValue({ then: thenMock });

      // Execute
      await new Promise(resolve => {
        Meme.findMemesByFilters({ skip: 5, limit: 20 }, (err, memes) => {
          // Assert
          expect(err).toBeNull();
          expect(memes.length).toBe(1);
          expect(skipMock).toHaveBeenCalledWith(5);
          expect(limitMock).toHaveBeenCalledWith(20);
          resolve();
        });
      });
    });
  });
});
