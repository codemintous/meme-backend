import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Single endpoint for both registration and login
export const authenticate = async (req: Request, res: Response) => {
  try {
    const { userAddress, serverAddress } = req.body;

    if (!userAddress || !serverAddress) {
      return res.status(400).json({ 
        message: 'userAddress and serverAddress are required' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ userAddress });

    if (user) {
      // User exists - generate token and return
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          userAddress: user.userAddress,
          serverAddress: user.serverAddress
        }
      });
    }

    // User doesn't exist - create new user
    const username = `user_${userAddress.slice(2, 8).toLowerCase()}`;
    
    user = new User({
      username,
      userAddress,
      serverAddress
    });

    await user.save();

    // Generate token for new user
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        userAddress: user.userAddress,
        serverAddress: user.serverAddress
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}; 