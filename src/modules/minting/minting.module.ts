import { Module } from '@nestjs/common';
import { MintingController } from './minting.controller';
import { MintingService } from './minting.service';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  controllers: [MintingController],
  providers: [MintingService, PrismaService, BlockchainService],
  exports: [MintingService],
})
export class MintingModule {}