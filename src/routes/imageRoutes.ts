import express from 'express';
import { generateImage } from '../controllers/imageController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Protected route - requires authentication
router.post('/generate', auth, generateImage);

export default router;
