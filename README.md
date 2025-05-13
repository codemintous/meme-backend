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

## License

MIT 