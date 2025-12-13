import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private registryContract: ethers.Contract;
  private marketplaceContract: ethers.Contract;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const privateKey = this.configService.get('PRIVATE_KEY');
    const registryAddr = this.configService.get('REGISTRY_CONTRACT_ADDRESS');
    const marketplaceAddr = this.configService.get('MARKETPLACE_CONTRACT_ADDRESS');

    if (!privateKey || privateKey === '0x...' || !registryAddr || registryAddr === '0x...' || !marketplaceAddr || marketplaceAddr === '0x...') {
      console.warn('⚠️  Blockchain service not initialized - deploy contracts first');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(this.configService.get('POLYGON_RPC_URL'));
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const registryAbi = [
      'function mint(address to, uint256 amount, string projectId) returns (uint256)',
      'event CreditsMinted(uint256 indexed tokenId, address indexed to, uint256 amount, string projectId)'
    ];
    const marketplaceAbi = [
      'function createListing(uint256 tokenId, uint256 amount, uint256 price) returns (uint256)',
      'function buy(uint256 listingId, uint256 amount) payable'
    ];

    this.registryContract = new ethers.Contract(registryAddr, registryAbi, this.wallet);
    this.marketplaceContract = new ethers.Contract(marketplaceAddr, marketplaceAbi, this.wallet);

    console.log('✅ Blockchain service initialized');
  }

  async mintCredits(to: string, amount: number, projectId: string = ''): Promise<string> {
    if (!this.registryContract) throw new Error('Blockchain service not initialized');
    
    // Contract requires 0.001 ETH per credit
    const mintFeePerCredit = ethers.parseEther('0.001');
    const totalFee = mintFeePerCredit * BigInt(amount);
    
    const tx = await this.registryContract.mint(ethers.getAddress(to), amount, projectId, { value: totalFee });
    const receipt = await tx.wait();
    
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.registryContract.interface.parseLog(log);
        return parsed?.name === 'CreditsMinted';
      } catch { return false; }
    });
    
    if (event) {
      const parsed = this.registryContract.interface.parseLog(event);
      const tokenId = parsed.args.tokenId.toString();
      console.log('Extracted token ID:', tokenId);
      return tokenId;
    }
    
    return '0';
  }

  async mintCreditsAdvanced(projectId: string, amount: number, metadataUri: string, ownerAddress: string): Promise<string> {
    if (!this.registryContract) throw new Error('500_CHAIN_ERROR: Blockchain service not initialized');
    
    try {
      // Contract requires 0.001 ETH per credit
      const mintFeePerCredit = ethers.parseEther('0.001');
      const totalFee = mintFeePerCredit * BigInt(amount);
      
      const tx = await this.registryContract.mint(
        ethers.getAddress(ownerAddress), 
        amount, 
        projectId, 
        { value: totalFee }
      );
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.registryContract.interface.parseLog(log);
          return parsed?.name === 'CreditsMinted';
        } catch { return false; }
      });
      
      if (event) {
        const parsed = this.registryContract.interface.parseLog(event);
        const tokenId = parsed.args.tokenId.toString();
        console.log('Minted tokenId:', tokenId, 'for project:', projectId);
        return tokenId;
      }
      
      throw new Error('500_CHAIN_ERROR: No CreditsMinted event found');
    } catch (error) {
      throw new Error('500_CHAIN_ERROR: ' + error.message);
    }
  }

  async createListing(tokenId: string, amount: number, pricePerToken: number): Promise<string> {
    if (!this.marketplaceContract) throw new Error('Blockchain service not initialized');
    
    const priceInWei = ethers.parseEther(pricePerToken.toString());
    const tx = await this.marketplaceContract.createListing(tokenId, amount, priceInWei);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async buyCredits(listingId: string, amount: number): Promise<string> {
    if (!this.marketplaceContract) throw new Error('Blockchain service not initialized');
    
    const tx = await this.marketplaceContract.buy(listingId, amount);
    const receipt = await tx.wait();
    return receipt.hash;
  }
}
