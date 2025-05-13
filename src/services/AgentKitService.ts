import { OpenAI } from 'openai';

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
      OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length,
      HAS_OPENAI_API_KEY: !!process.env.OPENAI_API_KEY
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
    this.agents = new Map();
  }

  async chat(message: string, systemMessage: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content || 'No response generated';
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image was generated');
      }

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('Generated image URL is missing');
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
      // Use OpenAI to generate a response
      const completion = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are ${agent.name}, ${agent.description}. Your personality is ${agent.metadata.personality}.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });

      return completion.choices[0].message.content;
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