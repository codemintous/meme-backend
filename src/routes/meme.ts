import express from 'express';
import { createMeme, getMemes, getMemeById, likeMeme, getMemesByUser, updateMeme } from '../controllers/memeController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/', auth, createMeme);
router.post('/:id/like', auth, likeMeme);
router.put('/:id', auth, updateMeme);

// Public routes
router.get('/', getMemes);
router.get('/my', getMemesByUser);
router.get('/:id', getMemeById);

export default router; 