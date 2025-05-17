import express from 'express';
import { generateImage } from '../controllers/imageController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Simple health check route
router.get('/', (_req, res) => {
  res.json({ status: 'Image routes are working' });
});

// Protected route - requires authentication
router.post('/generate', auth, generateImage);

console.log('Image routes initialized');

export default router;
