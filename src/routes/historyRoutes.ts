import express from 'express';
import { auth } from '../middleware/auth';
import {
    getChatHistory,
    getImageHistory,
    getAgentChatHistory,
    getAgentImageHistory,
    getImagesByUserAddress,
    getAllAgentImages,
    getCombinedChatHistory,
    getFilteredImages
} from '../controllers/historyController';

const router = express.Router();

// Combined chat history route (requires authentication)
router.get('/combined-chat', auth, getCombinedChatHistory);

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

// Get filtered images by user address and agent
router.get('/filtered-images', getFilteredImages);

export default router;
