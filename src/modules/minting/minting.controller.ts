import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MintingService } from './minting.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '@prisma/client';

interface MintRequestDto {
  projectId: string;
  vintageYear: number;
  projectType: string;
  calculationInputs: any;
  monitoringPeriod: { from: string; to: string };
  evidence: string[];
  methodology: string;
}

@Controller('mint')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MintingController {
  constructor(private mintingService: MintingService) {}

  @Post('authorize')
  @Roles(UserRole.PROJECT_OWNER, UserRole.ADMIN)
  async getMintAuthorization(@CurrentUser() user: any, @Body() request: MintRequestDto) {
    try {
      return await this.mintingService.createMintAuthorization(user.id, request);
    } catch (error) {
      const message = error.message;
      
      if (message.startsWith('400_BAD_INPUT')) {
        throw new Error(message);
      } else if (message.startsWith('401_UNAUTHORIZED')) {
        throw new Error(message);
      } else if (message.startsWith('403_')) {
        throw new Error(message);
      } else if (message.startsWith('409_DUPLICATE_VINTAGE')) {
        throw new Error(message);
      } else if (message.startsWith('422_DOCS_INCOMPLETE')) {
        throw new Error(message);
      } else if (message.startsWith('500_')) {
        throw new Error(message);
      } else {
        throw new Error('500_INTERNAL_ERROR: ' + message);
      }
    }
  }

  @Post()
  @Roles(UserRole.PROJECT_OWNER, UserRole.ADMIN)
  async mint(@CurrentUser() user: any, @Body() request: MintRequestDto) {
    try {
      return await this.mintingService.mintCredits(user.id, request);
    } catch (error) {
      throw new Error(error.message || 'Minting failed');
    }
  }
}