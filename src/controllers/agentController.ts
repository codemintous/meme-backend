import { Request, Response } from 'express';
import { AgentKitService, Agent, AgentConfig } from '../services/AgentKitService';
import Meme from '../models/Meme';

const agentService = new AgentKitService();
let agentInstance: Agent | null = null;
let agentConfig: AgentConfig | null = null;


// Initialize agent on startup
(async () => {
  try {
    const { agent, config } = await agentService.initializeAgent();
    agentInstance = agent;
    agentConfig = config;
  } catch (error) {
    console.error('Failed to initialize agent:', error);
  }
})();

export const createAgent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      personality,
      category,
      socialMediaLinks
    } = req.body;

    const agent = await agentService.createAgent({
      name,
      description,
      personality,
      category,
      socialMediaLinks
    });

    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create agent' });
  }
};

export const chatWithAgent = async (req: Request, res: Response) => {
  try {
    const { agentId, message, imageUrl } = req.body;
    const meme = await Meme.findById(agentId);

    if (!meme) {
      return res.status(404).json({ message: 'Meme agent not found' });
    }

    const systemMessage = `You are ${meme.name}, a meme agent with the following characteristics: 
    - Description: ${meme.description}
    - Personality: ${meme.personality}
    - Token: ${meme.tokenDetails.name} (${meme.tokenDetails.symbol})
    
    Respond in a way that matches your personality and characteristics.`;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const response = await agentService.chat(message, systemMessage, userId.toString(), agentId, imageUrl);

    res.json({
      message: 'Chat response received',
      response: response,
      imageUrl: imageUrl,
      agent: {
        name: meme.name,
        description: meme.description,
        personality: meme.personality,
        tokenDetails: meme.tokenDetails
      }
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ message: 'Error processing chat request' });
  }
};

export const startAutonomousMode = async (req: Request, res: Response) => {
  try {
    if (!agentInstance || !agentConfig) {
      return res.status(500).json({ error: 'Agent not initialized' });
    }

    // Start autonomous mode in the background
    await agentService.runAutonomousMode(agentInstance, agentConfig);
    res.json({ message: 'Autonomous mode started' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to start autonomous mode' });
  }
};

export const getAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agent = await agentService.getAgent(agentId);
    res.json(agent);
  } catch (error) {
    res.status(404).json({ error: 'Agent not found' });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const {
      name,
      description,
      personality,
      category,
      socialMediaLinks
    } = req.body;

    const agent = await agentService.updateAgent(agentId, {
      name,
      description,
      personality,
      category,
      socialMediaLinks
    });

    res.json(agent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update agent' });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const result = await agentService.deleteAgent(agentId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete agent' });
  }
};

// Generate image from prompt
export const generateImage = async (req: Request, res: Response) => {
  try {
    const { agentId, prompt } = req.body;
    const meme = await Meme.findById(agentId);

    if (!meme) {
      return res.status(404).json({ message: 'Meme agent not found' });
    }

    const enhancedPrompt = `Create an image in the style of ${meme.name}, who is ${meme.personality}. ${prompt}`;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const imageUrl = await agentService.generateImage(enhancedPrompt, userId.toString(), agentId);

    // After generating image, save a chat entry with the image
    const systemMessage = `You are ${meme.name}, a meme agent with the following characteristics: 
    - Description: ${meme.description}
    - Personality: ${meme.personality}
    - Token: ${meme.tokenDetails.name} (${meme.tokenDetails.symbol})`;

    await agentService.chat(
      `Generated image with prompt: ${prompt}`,
      systemMessage,
      userId.toString(),
      agentId,
      imageUrl
    );

    res.json({
      message: 'Image generated successfully',
      imageUrl: imageUrl,
      agent: {
        name: meme.name,
        description: meme.description,
        personality: meme.personality,
        tokenDetails: meme.tokenDetails
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ message: 'Error generating image' });
  }
}; 