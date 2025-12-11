import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [BlockchainModule, ProjectsModule],
  controllers: [ValidationController],
  providers: [ValidationService, PrismaService],
})
export class ValidationModule {}
