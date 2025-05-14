import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatHistory from '../models/ChatHistory';
import ImageHistory from '../models/ImageHistory';

export interface Agent {
  id: string;
  name: string;
  description: string;
  metadata: {
    personality: string;
    category: string;
    socialMediaLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
  };
  createdAt: Date;
}

export interface AgentConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  actions: string[];
}

export class AgentKitService {
  private genAI: GoogleGenerativeAI;
  private agents: Map<string, Agent>;

  constructor() {
    console.log('Environment variables:', {
      GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length,
      HAS_GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.agents = new Map();
  }

  async chat(message: string, systemMessage: string, userId: string, agentId: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{text: systemMessage}] },
          { role: "model", parts: [{text: "Okay, I understand my role."}] }, // Priming the model
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      });
      const result = await chat.sendMessage(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  async generateImage(prompt: string, userId: string, agentId: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "imagen-001" }); // Or the latest appropriate Imagen model for Gemini
      const result = await model.generateContent(prompt);

      // Safely access the image URI
      const candidates = result?.response?.candidates;
      const firstCandidate = candidates && candidates.length > 0 ? candidates[0] : undefined;
      const parts = firstCandidate?.content?.parts;
      const firstPart = parts && parts.length > 0 ? parts[0] : undefined;
      
      let imageUrl: string | undefined = undefined;
      if (firstPart?.fileData) {
        imageUrl = firstPart.fileData.fileUri; // Prefer fileUri as per common SDK patterns
      }

      if (!imageUrl) {
        console.error("Gemini API Response (Full):", JSON.stringify(result, null, 2));
        if (firstPart?.fileData) {
          console.error("Gemini API Response (fileData part):", JSON.stringify(firstPart.fileData, null, 2));
        }
        throw new Error('Generated image URL is missing or in an unexpected format. Check console for API response details.');
      }
      // Store image generation history
      await ImageHistory.create({
        userId,
        agentId,
        prompt,
        imageUrl
      });

      return imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  async initializeAgent(): Promise<{ agent: Agent; config: AgentConfig }> {
    const config: AgentConfig = {
      maxTokens: 500,
      temperature: 0.7,
      model: 'gpt-4',
      actions: ['create_meme', 'edit_meme', 'share_meme', 'analyze_trends']
    };

    const agent: Agent = {
      id: 'default',
      name: 'Default Agent',
      description: 'A helpful AI assistant',
      metadata: {
        personality: 'Friendly and professional',
        category: 'General'
      },
      createdAt: new Date()
    };

    this.agents.set(agent.id, agent);
    return { agent, config };
  }

  async runChatMode(agent: Agent, config: AgentConfig, message: string) {
    try {
      // Use Gemini to generate a response
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `You are ${agent.name}, ${agent.description}. Your personality is ${agent.metadata.personality}.` }]
          },
          { role: "model", parts: [{text: "Okay, I understand my role."}] }, // Priming the model
        ],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature
        }
      });
      const result = await chat.sendMessage(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error in chat mode:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async runAutonomousMode(agent: Agent, config: AgentConfig) {
    try {
      // Implement autonomous mode logic here
      // This could involve setting up a background process or webhook
      console.log(`Starting autonomous mode for agent ${agent.name}`);
      return { success: true, message: 'Autonomous mode started' };
    } catch (error) {
      console.error('Error starting autonomous mode:', error);
      throw new Error('Failed to start autonomous mode');
    }
  }

  async createAgent(params: {
    name: string;
    description: string;
    personality: string;
    category: string;
    socialMediaLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
  }): Promise<Agent> {
    try {
      const agent: Agent = {
        id: `agent_${Date.now()}`,
        name: params.name,
        description: params.description,
        metadata: {
          personality: params.personality,
          category: params.category,
          socialMediaLinks: params.socialMediaLinks
        },
        createdAt: new Date()
      };

      this.agents.set(agent.id, agent);
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent');
    }
  }

  async getAgent(agentId: string): Promise<Agent> {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }
      return agent;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent');
    }
  }

  async updateAgent(agentId: string, params: {
    name?: string;
    description?: string;
    personality?: string;
    category?: string;
    socialMediaLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
    };
  }): Promise<Agent> {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const updatedAgent: Agent = {
        ...agent,
        name: params.name || agent.name,
        description: params.description || agent.description,
        metadata: {
          ...agent.metadata,
          personality: params.personality || agent.metadata.personality,
          category: params.category || agent.metadata.category,
          socialMediaLinks: params.socialMediaLinks || agent.metadata.socialMediaLinks
        }
      };

      this.agents.set(agentId, updatedAgent);
      return updatedAgent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent');
    }
  }

  async deleteAgent(agentId: string) {
    try {
      const success = this.agents.delete(agentId);
      if (!success) {
        throw new Error('Agent not found');
      }
      return { success: true, message: 'Agent deleted successfully' };
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw new Error('Failed to delete agent');
    }
  }
} 