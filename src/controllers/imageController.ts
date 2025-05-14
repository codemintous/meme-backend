import { Request, Response } from 'express';
import { AgentKitService } from '../services/AgentKitService';
import ImageHistory from '../models/ImageHistory';

const agentKitService = new AgentKitService();

export const generateImage = async (req: Request, res: Response) => {
    try {
        const { prompt, agentId } = req.body;
        const userId = req.user?._id;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!agentId) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const imageUrl = await agentKitService.generateImage(prompt, userId.toString(), agentId);

        // Store image generation history
        await ImageHistory.create({
            userId,
            agentId,
            prompt,
            imageUrl
        });

        return res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error in image generation:', error);
        return res.status(500).json({ error: 'Failed to generate image' });
    }
};
