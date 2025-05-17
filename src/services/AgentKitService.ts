import OpenAI from "openai";
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
  private openai: OpenAI;
  private agents: Map<string, Agent>;

  constructor() {
    console.log('Environment variables:', {
      XAI_API_KEY_LENGTH: process.env.XAI_API_KEY?.length,
      HAS_XAI_API_KEY: !!process.env.XAI_API_KEY
    });

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('XAI_API_KEY is not set in environment variables');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.x.ai/v1"
    });
    this.agents = new Map();
  }

  async chat(message: string, systemMessage: string, userId: string, agentId: string, imageUrl?: string): Promise<string> {
    try {
      console.log('Starting chat with params:', { message, userId, agentId, imageUrl });
      
      const response = await this.openai.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const responseContent = response.choices[0]?.message?.content || 'No response generated';
      console.log('Received response from AI:', responseContent);

      // Save chat history to database
      try {
        // Find the latest conversation for this user and agent
        let chatHistory = await ChatHistory.findOne({
          userId,
          agentId
        }).sort({ updatedAt: -1 });

        // If no conversation exists or the last message was more than 30 minutes ago, create a new conversation
        if (!chatHistory || (Date.now() - chatHistory.updatedAt.getTime() > 30 * 60 * 1000)) {
          chatHistory = await ChatHistory.create({
            userId,
            agentId,
            messages: []
          });
        }

        // Add the new message to the conversation
        chatHistory.messages.push({
          message,
          response: responseContent,
          imageUrl,
          timestamp: new Date()
        });

        await chatHistory.save();
        console.log('Successfully saved chat history:', chatHistory);
      } catch (saveError) {
        console.error('Error saving chat history:', saveError);
        throw saveError;
      }
      
      return responseContent;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  async generateImage(prompt: string, userId: string, agentId: string): Promise<string> {
    try {
      console.log('Starting image generation with params:', { prompt, userId, agentId });
      
      const response = await this.openai.images.generate({
        model: "grok-2-image-1212",
        prompt: prompt
      });

      const imageUrl = response.data?.[0]?.url;
      
      if (!imageUrl) {
        console.error("X.AI API Response:", JSON.stringify(response, null, 2));
        throw new Error('Generated image URL is missing or in an unexpected format. Check console for API response details.');
      }
      console.log('Generated image URL:', imageUrl);

      // Store image generation history
      try {
        const imageHistory = await ImageHistory.create({
          userId,
          agentId,
          prompt,
          imageUrl
        });
        console.log('Successfully saved image history:', imageHistory);
      } catch (saveError) {
        console.error('Error saving image history:', saveError);
        throw saveError;
      }

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
      // Use X.AI to generate a response
      const response = await this.openai.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { 
            role: "system", 
            content: `You are ${agent.name}, ${agent.description}. Your personality is ${agent.metadata.personality}.` 
          },
          { role: "user", content: message }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });
      
      return response.choices[0]?.message?.content || 'No response generated';
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