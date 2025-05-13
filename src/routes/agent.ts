import express from 'express';
import { 
  createAgent, 
  getAgent, 
  updateAgent, 
  deleteAgent,
  chatWithAgent,
  startAutonomousMode,
  generateImage
} from '../controllers/agentController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All agent routes are protected with authentication
router.use(auth);

// Agent management routes
router.post('/', createAgent);
router.get('/:agentId', getAgent);
router.put('/:agentId', updateAgent);
router.delete('/:agentId', deleteAgent);

// Agent interaction routes
router.post('/chat', chatWithAgent);
router.post('/autonomous', startAutonomousMode);
router.post('/generate-image', generateImage);

export default router; 