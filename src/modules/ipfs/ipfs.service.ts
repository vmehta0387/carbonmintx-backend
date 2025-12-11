import { Injectable } from '@nestjs/common';

@Injectable()
export class IpfsService {
  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    // TODO: Implement IPFS upload
    // Using Pinata, Infura, or local IPFS node
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
    return mockCid;
  }

  async uploadMetadata(metadata: any): Promise<string> {
    // TODO: Upload JSON metadata to IPFS
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
    return mockCid;
  }

  getGatewayUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }
}