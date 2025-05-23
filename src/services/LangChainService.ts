import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

export class LangChainService {
  private model: ChatOpenAI;
  private parser: StructuredOutputParser<typeof memeSchema>;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: process.env.XAI_API_KEY, // Make sure to set this environment variable
      temperature: 0.7,
      modelName: "grok-3-latest",
      configuration: {
        baseURL: "https://api.x.ai/v1"
      }
    });

    this.parser = StructuredOutputParser.fromZodSchema(memeSchema);
  }

  async generateMeme(prompt: string) {
    const formatInstructions = this.parser.getFormatInstructions();

    const promptTemplate = new PromptTemplate({
      template: `Generate a meme based on the following prompt: {prompt}
      {format_instructions}`,
      inputVariables: ['prompt'],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await promptTemplate.format({ prompt });
    const response = await this.model.predict(input);
    const parsedResponse = await this.parser.parse(response);

    return parsedResponse;
  }
}

const memeSchema = z.object({
  name: z.string().describe('The name of the meme'),
  category: z.string().describe('The category of the meme'),
  description: z.string().describe('A detailed description of the meme'),
  personality: z.string().describe('The personality traits of the meme'),
  socialMediaLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }).describe('Social media links for the meme'),
  profileImageUrl: z.string().describe('URL for the meme profile image'),
  coverImageUrl: z.string().describe('URL for the meme cover image'),
}); 