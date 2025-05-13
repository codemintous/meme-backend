import { ethers } from 'ethers';
import { ERC20__factory } from '../contracts/ERC20__factory';

export class TokenService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY!, this.provider);
  }

  async deployToken(name: string, symbol: string, initialSupply: string) {
    const factory = new ERC20__factory(this.wallet);
    const token = await factory.deploy(name, symbol, ethers.parseEther(initialSupply));
    await token.waitForDeployment();
    
    return {
      address: await token.getAddress(),
      name,
      symbol,
      totalSupply: initialSupply
    };
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string) {
    const token = ERC20__factory.connect(tokenAddress, this.provider);
    const balance = await token.balanceOf(walletAddress);
    return ethers.formatEther(balance);
  }

  async transferToken(tokenAddress: string, to: string, amount: string) {
    const token = ERC20__factory.connect(tokenAddress, this.wallet);
    const tx = await token.transfer(to, ethers.parseEther(amount));
    await tx.wait();
    return tx.hash;
  }
} 