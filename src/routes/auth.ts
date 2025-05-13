import express from 'express';
import { authenticate } from '../controllers/authController';

const router = express.Router();

// Single endpoint for both registration and login
router.post('/authenticate', authenticate);

export default router; 