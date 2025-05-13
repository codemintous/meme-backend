import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createMeme, getMemes, getMemeById, likeMeme } from '../controllers/memeController';
import Meme from '../models/Meme';

// Mock the Meme model
jest.mock('../models/Meme');

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Meme Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result: any) => {
        responseObject = result;
        return mockResponse;
      })
    };
    // Clear console.error mock before each test
    (console.error as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMeme', () => {
    const mockMemeData = {
      agentName: 'TestMemeAgent',
      category: 'Funny',
      description: 'A test meme agent',
      personality: 'Witty and sarcastic',
      socialMediaLinks: {
        twitter: 'https://twitter.com/testagent',
        instagram: 'https://instagram.com/testagent'
      },
      profileImageUrl: 'https://example.com/profile.jpg',
      coverImageUrl: 'https://example.com/cover.jpg',
      tokenDetails: {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'Test token description',
        tokenAddress: '0x1234567890abcdef'
      }
    };

    it('should create a new meme successfully', async () => {
      mockRequest.body = mockMemeData;
      
      const savedMeme = {
        _id: new mongoose.Types.ObjectId(),
        ...mockMemeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockSave = jest.fn().mockResolvedValue(savedMeme);

      (Meme as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave
      }));

      await createMeme(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Meme agent created successfully',
        meme: {
          _id: savedMeme._id,
          agentName: savedMeme.agentName,
          category: savedMeme.category,
          description: savedMeme.description,
          personality: savedMeme.personality,
          socialMediaLinks: savedMeme.socialMediaLinks,
          profileImageUrl: savedMeme.profileImageUrl,
          coverImageUrl: savedMeme.coverImageUrl,
          tokenDetails: savedMeme.tokenDetails,
          createdAt: savedMeme.createdAt,
          updatedAt: savedMeme.updatedAt
        }
      });
    });

    it('should handle errors when creating a meme', async () => {
      mockRequest.body = mockMemeData;
      
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      
      (Meme as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave
      }));

      await createMeme(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating meme agent'
      });
    });
  });

  describe('getMemes', () => {
    it('should get all memes successfully', async () => {
      const mockMemes = [
        {
          _id: new mongoose.Types.ObjectId(),
          agentName: 'TestMemeAgent1',
          category: 'Funny',
          description: 'Test description 1',
          personality: 'Witty',
          socialMediaLinks: {},
          profileImageUrl: 'https://example.com/profile1.jpg',
          coverImageUrl: 'https://example.com/cover1.jpg',
          tokenDetails: {
            name: 'Test Token 1',
            symbol: 'TEST1',
            description: 'Test token 1',
            tokenAddress: '0x1234567890abcdef'
          },
          creator: { username: 'testuser1', userAddress: '0x123' },
          likes: 0,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          agentName: 'TestMemeAgent2',
          category: 'Tech',
          description: 'Test description 2',
          personality: 'Sarcastic',
          socialMediaLinks: {},
          profileImageUrl: 'https://example.com/profile2.jpg',
          coverImageUrl: 'https://example.com/cover2.jpg',
          tokenDetails: {
            name: 'Test Token 2',
            symbol: 'TEST2',
            description: 'Test token 2',
            tokenAddress: '0xabcdef1234567890'
          },
          creator: { username: 'testuser2', userAddress: '0x456' },
          likes: 5,
          createdAt: new Date()
        }
      ];

      (Meme.find as unknown as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMemes)
      });

      await getMemes(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        memes: expect.arrayContaining([
          expect.objectContaining({
            agentName: 'TestMemeAgent1',
            category: 'Funny'
          }),
          expect.objectContaining({
            agentName: 'TestMemeAgent2',
            category: 'Tech'
          })
        ])
      });
    });
  });

  describe('getMemeById', () => {
    it('should get a meme by id successfully', async () => {
      const mockMeme = {
        _id: new mongoose.Types.ObjectId(),
        agentName: 'TestMemeAgent',
        category: 'Funny',
        description: 'Test description',
        personality: 'Witty',
        socialMediaLinks: {},
        profileImageUrl: 'https://example.com/profile.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
        tokenDetails: {
          name: 'Test Token',
          symbol: 'TEST',
          description: 'Test token',
          tokenAddress: '0x1234567890abcdef'
        },
        creator: { username: 'testuser', userAddress: '0x123' },
        likes: 0,
        createdAt: new Date()
      };

      mockRequest.params = { id: mockMeme._id.toString() };

      (Meme.findById as unknown as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMeme)
      });

      await getMemeById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        meme: expect.objectContaining({
          agentName: 'TestMemeAgent',
          category: 'Funny'
        })
      });
    });

    it('should return 404 when meme is not found', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };

      (Meme.findById as unknown as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getMemeById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Meme not found'
      });
    });
  });

  describe('likeMeme', () => {
    it('should like a meme successfully', async () => {
      const mockMeme = {
        _id: new mongoose.Types.ObjectId(),
        likes: 0,
        save: jest.fn().mockResolvedValue({ likes: 1 })
      };

      mockRequest.params = { id: mockMeme._id.toString() };

      (Meme.findById as unknown as jest.Mock).mockResolvedValue(mockMeme);

      await likeMeme(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Meme liked successfully',
        likes: 1
      });
    });

    it('should return 404 when trying to like non-existent meme', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };

      (Meme.findById as unknown as jest.Mock).mockResolvedValue(null);

      await likeMeme(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Meme not found'
      });
    });
  });
}); 