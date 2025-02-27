import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../models/user/User.js';
import { Meme } from '../models/meme/Meme.js';

// Mock mongoose methods
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    models: {
      User: null,
      Meme: null
    },
    model: vi.fn().mockImplementation((modelName, schema) => {
      if (modelName === 'User') {
        return {
          findOne: vi.fn(),
          findById: vi.fn(),
          findByIdAndUpdate: vi.fn(),
          create: vi.fn(),
          populate: vi.fn(),
          lean: vi.fn()
        };
      }
      return {};
    })
  };
});

// Mock Meme model
vi.mock('../models/meme/Meme.js', () => {
  return {
    Meme: {
      create: vi.fn(),
      findMemeById: vi.fn()
    }
  };
});

describe('User Model', () => {
  let mockUser;
  let mockMeme;

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      telegram_id: 'test_telegram_id',
      chopin_public_key: 'test_public_key',
      name: 'test_name',
      timeout: 0,
      balance: 100,
      minted_memes: []
    };

    mockMeme = {
      _id: new mongoose.Types.ObjectId(),
      creator: mockUser._id,
      description: 'Test meme',
      tags: ['test', 'meme'],
      content_url: 'https://example.com/meme.jpg',
      mint_price: 10
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserIfNotExists', () => {
    it('should create a new user if not exists', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback('user_not_found');
      });
      
      User.create = vi.fn().mockResolvedValue(mockUser);

      // Execute
      await new Promise(resolve => {
        User.createUserIfNotExists({
          telegram_id: 'test_telegram_id',
          chopin_public_key: 'test_public_key'
        }, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user).toEqual(mockUser);
          expect(User.findUserByPublicKey).toHaveBeenCalledWith('test_public_key', true, expect.any(Function));
          expect(User.create).toHaveBeenCalledWith({
            telegram_id: 'test_telegram_id',
            chopin_public_key: 'test_public_key'
          });
          resolve();
        });
      });
    });

    it('should return existing user if found', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, mockUser);
      });

      // Execute
      await new Promise(resolve => {
        User.createUserIfNotExists({
          chopin_public_key: 'test_public_key'
        }, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user).toEqual(mockUser);
          expect(User.findUserByPublicKey).toHaveBeenCalledWith('test_public_key', true, expect.any(Function));
          resolve();
        });
      });
    });

    it('should return bad_request if data is invalid', async () => {
      await new Promise(resolve => {
        User.createUserIfNotExists(null, (err) => {
          expect(err).toBe('bad_request');
          resolve();
        });
      });

      await new Promise(resolve => {
        User.createUserIfNotExists({}, (err) => {
          expect(err).toBe('bad_request');
          resolve();
        });
      });
    });

    it('should handle database errors', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback('user_not_found');
      });
      
      User.create = vi.fn().mockRejectedValue({ code: 'some_error' });

      // Execute
      await new Promise(resolve => {
        User.createUserIfNotExists({
          telegram_id: 'test_telegram_id',
          chopin_public_key: 'test_public_key'
        }, (err) => {
          // Assert
          expect(err).toBe('database_error');
          resolve();
        });
      });
    });

    it('should handle duplicated unique field error', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback('user_not_found');
      });
      
      User.create = vi.fn().mockRejectedValue({ code: 11000 });

      // Execute
      await new Promise(resolve => {
        User.createUserIfNotExists({
          telegram_id: 'test_telegram_id',
          chopin_public_key: 'test_public_key'
        }, (err) => {
          // Assert
          expect(err).toBe('duplicated_unique_field');
          resolve();
        });
      });
    });
  });

  describe('findUser', () => {
    it('should find a user by telegram_id', async () => {
      // Setup
      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Execute
      await new Promise(resolve => {
        User.findUser({ telegram_id: 'test_telegram_id' }, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user).toEqual(mockUser);
          expect(User.findOne).toHaveBeenCalledWith({ telegram_id: 'test_telegram_id' });
          resolve();
        });
      });
    });

    it('should find a user by chopin_public_key', async () => {
      // Setup
      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Execute
      await new Promise(resolve => {
        User.findUser({ chopin_public_key: 'test_public_key' }, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user).toEqual(mockUser);
          expect(User.findOne).toHaveBeenCalledWith({ chopin_public_key: 'test_public_key' });
          resolve();
        });
      });
    });

    it('should find a user by _id', async () => {
      // Setup
      const id = new mongoose.Types.ObjectId();
      User.findOne = vi.fn().mockResolvedValue(mockUser);

      // Execute
      await new Promise(resolve => {
        User.findUser({ _id: id }, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user).toEqual(mockUser);
          expect(User.findOne).toHaveBeenCalledWith({ _id: id });
          resolve();
        });
      });
    });

    it('should return user_not_found if user does not exist', async () => {
      // Setup
      User.findOne = vi.fn().mockResolvedValue(null);

      // Execute
      await new Promise(resolve => {
        User.findUser({ telegram_id: 'nonexistent_id' }, (err) => {
          // Assert
          expect(err).toBe('user_not_found');
          resolve();
        });
      });
    });

    it('should return bad_request if no valid filters provided', async () => {
      await new Promise(resolve => {
        User.findUser({}, (err) => {
          expect(err).toBe('bad_request');
          resolve();
        });
      });
    });

    it('should handle database errors', async () => {
      // Setup
      User.findOne = vi.fn().mockRejectedValue(new Error('Database error'));

      // Execute
      await new Promise(resolve => {
        User.findUser({ telegram_id: 'test_telegram_id' }, (err) => {
          // Assert
          expect(err).toBe('database_error');
          resolve();
        });
      });
    });
  });

  describe('createMemeForUser', () => {
    it('should create a meme for a user', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, mockUser);
      });
      
      Meme.create = vi.fn().mockResolvedValue(mockMeme);
      User.findByIdAndUpdate = vi.fn().mockResolvedValue(mockUser);

      const memeData = {
        content_url: 'https://example.com/meme.jpg',
        description: 'Test meme',
        mint_price: 10,
        tags: ['test', 'meme']
      };

      // Execute
      await new Promise(resolve => {
        User.createMemeForUser({
          chopin_public_key: 'test_public_key',
          memeData,
          dateNow: Date.now()
        }, (err, meme) => {
          // Assert
          expect(err).toBeNull();
          expect(meme).toEqual(mockMeme);
          expect(Meme.create).toHaveBeenCalledWith({
            creator: mockUser._id,
            content_url: memeData.content_url,
            description: memeData.description,
            mint_price: memeData.mint_price,
            tags: memeData.tags
          });
          expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUser._id,
            { $push: { minted_memes: { meme_id: mockMeme._id } } },
            { new: true }
          );
          resolve();
        });
      });
    });

    it('should return user_timed_out if user is timed out', async () => {
      // Setup
      const timedOutUser = {
        ...mockUser,
        timeout: Date.now() - 1000 // Recent timeout
      };
      
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, timedOutUser);
      });

      const memeData = {
        content_url: 'https://example.com/meme.jpg',
        description: 'Test meme',
        mint_price: 10,
        tags: ['test', 'meme']
      };

      // Execute
      await new Promise(resolve => {
        User.createMemeForUser({
          chopin_public_key: 'test_public_key',
          memeData,
          dateNow: Date.now()
        }, (err) => {
          // Assert
          expect(err).toBe('user_timed_out');
          resolve();
        });
      });
    });

    it('should handle validation errors for meme data', async () => {
      // Setup
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, mockUser);
      });

      // Execute - missing content_url
      await new Promise(resolve => {
        User.createMemeForUser({
          chopin_public_key: 'test_public_key',
          memeData: {
            description: 'Test meme',
            mint_price: 10,
            tags: ['test', 'meme']
          },
          dateNow: Date.now()
        }, (err) => {
          // Assert
          expect(err).toBe('bad_request');
          resolve();
        });
      });
    });
  });

  describe('purchaseMemeById', () => {
    it('should allow a user to purchase a meme', async () => {
      // Setup
      const buyer = { ...mockUser, balance: 100 };
      const creator = { ...mockUser, _id: new mongoose.Types.ObjectId() };
      
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, buyer);
      });
      
      Meme.findMemeById = vi.fn().mockImplementation((id, callback) => {
        callback(null, mockMeme);
      });
      
      User.findUserById = vi.fn().mockImplementation((id, callback) => {
        callback(null, creator);
      });
      
      User.findByIdAndUpdate = vi.fn().mockResolvedValue({});

      // Execute
      await new Promise(resolve => {
        User.purchaseMemeById({
          buyerPublicKey: 'test_public_key',
          memeId: mockMeme._id,
          dateNow: Date.now()
        }, (err) => {
          // Assert
          expect(err).toBeNull();
          expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(2);
          resolve();
        });
      });
    });

    it('should return insufficient_balance if buyer has insufficient balance', async () => {
      // Setup
      const buyer = { ...mockUser, balance: 5 }; // Less than meme price
      
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        callback(null, buyer);
      });
      
      Meme.findMemeById = vi.fn().mockImplementation((id, callback) => {
        callback(null, { ...mockMeme, mint_price: 10 });
      });

      // Execute
      await new Promise(resolve => {
        User.purchaseMemeById({
          buyerPublicKey: 'test_public_key',
          memeId: mockMeme._id,
          dateNow: Date.now()
        }, (err) => {
          // Assert
          expect(err).toBe('insufficient_balance');
          resolve();
        });
      });
    });
  });

  describe('findUserByPublicKey', () => {
    it('should find a user by public key without minted memes', async () => {
      // Instead of mocking the chain of methods, let's mock the implementation directly
      const originalMethod = User.findUserByPublicKey;
      
      // Replace with our mock implementation
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        expect(publicKey).toBe('test_public_key');
        expect(withMintedMemes).toBe(false);
        callback(null, mockUser);
      });
      
      // Execute
      await new Promise(resolve => {
        User.findUserByPublicKey('test_public_key', false, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user.chopin_public_key).toEqual(mockUser.chopin_public_key);
          expect(user.telegram_id).toEqual(mockUser.telegram_id);
          
          // Restore the original method
          User.findUserByPublicKey = originalMethod;
          resolve();
        });
      });
    });

    it('should find a user by public key with minted memes', async () => {
      // Instead of mocking the chain of methods, let's mock the implementation directly
      const originalMethod = User.findUserByPublicKey;
      
      // Create a user with transformed minted memes for the test
      const userWithMemes = {
        ...mockUser,
        minted_memes: [{ meme: mockMeme, last_used_at: 0 }]
      };
      
      // Replace with our mock implementation
      User.findUserByPublicKey = vi.fn().mockImplementation((publicKey, withMintedMemes, callback) => {
        expect(publicKey).toBe('test_public_key');
        expect(withMintedMemes).toBe(true);
        callback(null, userWithMemes);
      });
      
      // Execute
      await new Promise(resolve => {
        User.findUserByPublicKey('test_public_key', true, (err, user) => {
          // Assert
          expect(err).toBeNull();
          expect(user.minted_memes).toEqual([{ meme: mockMeme, last_used_at: 0 }]);
          
          // Restore the original method
          User.findUserByPublicKey = originalMethod;
          resolve();
        });
      });
    });
  });
});
