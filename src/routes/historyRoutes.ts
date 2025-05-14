import express from 'express';
import { auth } from '../middleware/auth';
import {
    getChatHistory,
    getImageHistory,
    getAgentChatHistory,
    getAgentImageHistory,
    getImagesByUserAddress,
    getAllAgentImages
} from '../controllers/historyController';

const router = express.Router();

// User's personal history routes (requires authentication)
router.get('/chat', auth, getChatHistory);
router.get('/images', auth, getImageHistory);

// Agent-specific history routes (requires authentication)
router.get('/agent/:agentId/chat', auth, getAgentChatHistory);
router.get('/agent/:agentId/images', auth, getAgentImageHistory);

// Get all images by user's wallet address
router.get('/user/:userAddress/images', getImagesByUserAddress);

// Get all images for an agent with meme details
router.get('/agent/:agentId/all-images', getAllAgentImages);

export default router;
