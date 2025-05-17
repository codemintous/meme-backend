# Meme Platform Backend

A Node.js backend application for an AI-powered meme platform with ERC20 token integration.

## Features

- AI-powered meme generation using LangChain
- ERC20 token integration for meme tokens
- MongoDB database for storing meme and token information
- RESTful API endpoints for meme and token management

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Ethereum wallet with private key
- LangChain API key
- Infura API key (for Ethereum network access)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meme-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meme-platform
LANGCHAIN_API_KEY=your_langchain_api_key
ETHEREUM_NETWORK=sepolia
ETHEREUM_PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Meme Endpoints

- `POST /api/memes` - Create a new meme
- `GET /api/memes` - Get all memes
- `GET /api/memes/:id` - Get a specific meme
- `PUT /api/memes/:id` - Update a meme
- `DELETE /api/memes/:id` - Delete a meme

### Token Endpoints

- `POST /api/tokens` - Deploy a new ERC20 token
- `GET /api/tokens/:address` - Get token information
- `GET /api/tokens/:address/balance/:wallet` - Get token balance
- `POST /api/tokens/:address/transfer` - Transfer tokens

## Development

The project uses TypeScript for type safety and better development experience. The main components are:

- `src/models/` - MongoDB models
- `src/services/` - Business logic and external service integrations
- `src/controllers/` - API route handlers
- `src/routes/` - API route definitions
- `src/middleware/` - Custom middleware functions

## Base Components Implementation

### 1. Base Agent Interface
```typescript
// src/services/AgentKitService.ts
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
```

### 2. Base Agent Configuration
```typescript
// src/services/AgentKitService.ts
export interface AgentConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  actions: string[];
}
```

### 3. Base Agent Service
```typescript
// src/services/AgentKitService.ts
export class AgentKitService {
  private openai: OpenAI;
  private agents: Map<string, Agent>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1"
    });
    this.agents = new Map();
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
}
```

### 4. Base Model Interfaces

#### User Model
```typescript
// src/models/User.ts
export interface IUser extends Document {
  username: string;
  userAddress: string;
  serverAddress: string;
  publicKey?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Chat History Model
```typescript
// src/models/ChatHistory.ts
export interface IMessage {
    message: string;
    response: string;
    imageUrl?: string;
    timestamp: Date;
}

export interface IChatHistory extends Document {
    userId: mongoose.Types.ObjectId;
    agentId: string;
    conversationId: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}
```

### 5. Base Express Configuration
```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Base middleware setup
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
```

### 6. Base Type Definitions
```typescript
// src/types/express.d.ts
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
```

### 7. Base Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

These base components form the foundation of the application, providing:
- Type-safe agent management
- Secure API endpoints
- Structured data models
- Standardized configuration
- Type definitions for Express
- Base middleware setup

## License

MIT 