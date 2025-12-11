import { Controller, Post, Body, Get, UseGuards, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post('role')
  async setRole(@CurrentUser() user: any, @Body() body: { role: string }) {
    return this.onboardingService.setUserRole(user.id, body.role);
  }

  @Post('profile')
  async saveProfile(@CurrentUser() user: any, @Body() profileData: any) {
    return this.onboardingService.saveProfile(user.id, profileData);
  }

  @Post('policies')
  async acceptPolicies(@CurrentUser() user: any, @Body() policies: any) {
    return this.onboardingService.acceptPolicies(user.id, policies);
  }

  @Post('kyc')
  async submitKYC(@CurrentUser() user: any, @Body() kycData: any) {
    return this.onboardingService.submitKYC(user.id, kycData);
  }

  @Post('validator-docs')
  @UseInterceptors(FileInterceptor('document'))
  async submitValidatorDocs(
    @CurrentUser() user: any,
    @Body() validatorData: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.onboardingService.submitValidatorDocs(user.id, validatorData, file);
  }

  @Patch('complete')
  async completeOnboarding(@CurrentUser() user: any) {
    return this.onboardingService.completeOnboarding(user.id);
  }

  @Get('status')
  async getOnboardingStatus(@CurrentUser() user: any) {
    return this.onboardingService.getOnboardingStatus(user.id);
  }

  @Get('policies')
  async getPolicies(@CurrentUser() user: any) {
    return this.onboardingService.getPolicies(user.role);
  }
}