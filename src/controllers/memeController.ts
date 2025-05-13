import { Request, Response } from 'express';
import Meme from '../models/Meme';

// Create a new meme
export const createMeme = async (req: Request, res: Response) => {
  try {
    const { name, description, personality, tokenDetails, profileImageUrl, coverImageUrl, category, socialMediaLinks } = req.body;
    const userAddress = req.user?.userAddress;

    if (!userAddress) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Ensure a valid tokenAddress is provided
    if (!tokenDetails || !tokenDetails.tokenAddress) {
      return res.status(400).json({ message: 'Token address is required. Please deploy a token first or provide an existing token address.' });
    }

    const meme = new Meme({
      name,
      description,
      personality,
      creator: userAddress,
      tokenDetails,
      profileImageUrl,
      coverImageUrl,
      category,
      socialMediaLinks
    });

    const savedMeme = await meme.save();
    res.status(201).json(savedMeme);
  } catch (error: any) {
    console.warn('Error creating meme:', error);
    res.status(500).json({
      message: 'Error creating meme',
      error: error?.message || 'Unknown error occurred'
    });
  }
};

// Get all memes
export const getMemes = async (req: Request, res: Response) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching memes',
      error: error?.message || 'Unknown error occurred'
    });
  }
};

// Get a single meme by ID
export const getMemeById = async (req: Request, res: Response) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    res.json(meme);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching meme',
      error: error?.message || 'Unknown error occurred'
    });
  }
};

// Like a meme
export const likeMeme = async (req: Request, res: Response) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    meme.likes += 1;
    await meme.save();
    
    res.json({ message: 'Meme liked successfully', likes: meme.likes });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error liking meme',
      error: error?.message || 'Unknown error occurred'
    });
  }
}; 

// Get memes by user address
export const getMemesByUser = async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.query;
    if (!userAddress) {
      return res.status(400).json({ message: 'userAddress query parameter is required' });
    }

    const memes = await Meme.find({ creator: userAddress }).sort({ createdAt: -1 });
    res.json(memes);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching user memes',
      error: error?.message || 'Unknown error occurred'
    });
  }
};

// Update meme by id
export const updateMeme = async (req: Request, res: Response) => {
  try {
    const memeId = req.params.id;
    const updateData = req.body;
    const meme = await Meme.findByIdAndUpdate(memeId, updateData, { new: true });
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    res.json(meme);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating meme',
      error: error?.message || 'Unknown error occurred'
    });
  }
};