import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import agentRoutes from './routes/agent';
import memeRoutes from './routes/meme';
import imageRoutes from './routes/imageRoutes';
import historyRoutes from './routes/historyRoutes';
import { auth } from './middleware/auth';
import { IUser } from './models/User';

// Add type definition here
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/history', historyRoutes);

// Simple 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Protected routes
app.get('/api/protected', auth, (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 