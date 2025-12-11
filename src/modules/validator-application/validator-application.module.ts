import { Module } from '@nestjs/common';
import { ValidatorApplicationController } from './validator-application.controller';
import { ValidatorApplicationService } from './validator-application.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ValidatorApplicationController],
  providers: [ValidatorApplicationService, PrismaService],
})
export class ValidatorApplicationModule {}