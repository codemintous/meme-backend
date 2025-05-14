import { ethers } from 'ethers';

export class TokenService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  }

  async getBalance(walletAddress: string) {
    const balance = await this.provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  }

  async getTransactionCount(walletAddress: string) {
    return await this.provider.getTransactionCount(walletAddress);
  }
} 