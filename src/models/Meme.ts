import mongoose, { Document, Schema } from 'mongoose';

export interface TokenDetails {
  tokenAddress: string;
  name: string;
  symbol: string;
  description: string;
}

export interface Meme extends Document {
  name: string;
  description: string;
  personality: string;
  creator: string;
  tokenDetails: TokenDetails;
  profileImageUrl: string;
  coverImageUrl: string;
  likes: number;
  category: { id: string; name: string };
  socialMediaLinks: { [platform: string]: string };
  createdAt: Date;
  updatedAt: Date;
  avatarMintCount: number;
  avatarMints: {
    user: string;
    txHash: string;
    avatarUrl: string;
    mintedAt: Date;
  }[];
}

const memeSchema = new Schema<Meme>({
  name: { type: String },
  description: { type: String },
  personality: { type: String },
  creator: { type: String },
  tokenDetails: {
    tokenAddress: { type: String },
    name: { type: String },
    symbol: { type: String },
    description: { type: String }
  },
  profileImageUrl: { type: String },
  coverImageUrl: { type: String },
  likes: { type: Number, default: 0 },
  category: {
    id: { type: String },
    name: { type: String }
  },
  socialMediaLinks: {
    type: Map,
    of: String
  },
  avatarMintCount: { type: Number, default: 0 },
  avatarMints: [
    {
      user: { type: String },
      txHash: { type: String },
      avatarUrl: { type: String },
      mintedAt: { type: Date }
    }
  ]
}, {
  timestamps: true
});

export default mongoose.model<Meme>('Meme', memeSchema); 