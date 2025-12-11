import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, UseGuards, Patch, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatorApplicationService } from './validator-application.service';

@Controller('validator-application')
export class ValidatorApplicationController {
  constructor(private validatorApplicationService: ValidatorApplicationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('accreditationCert'))
  async submitApplication(
    @Body() applicationData: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log('Received application data:', applicationData);
    console.log('Received file:', file ? file.originalname : 'No file');
    
    if (!file) {
      throw new Error('Accreditation certificate is required');
    }
    
    return this.validatorApplicationService.submitApplication(applicationData, file);
  }

  @Get('pending')
  async getPendingApplications() {
    console.log('Getting pending applications...');
    const result = await this.validatorApplicationService.getPendingApplications();
    console.log('Found applications:', result.length);
    return result;
  }

  @Get('all')
  async getAllApplications() {
    return this.validatorApplicationService.getAllApplications();
  }

  @Get('status/:walletAddress')
  async getApplicationStatus(@Param('walletAddress') walletAddress: string) {
    return this.validatorApplicationService.getApplicationStatus(walletAddress);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approveApplication(@Param('id') id: string, @Body() body: { adminComments?: string }) {
    return this.validatorApplicationService.approveApplication(id, body.adminComments);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectApplication(@Param('id') id: string, @Body() body: { adminComments: string }) {
    return this.validatorApplicationService.rejectApplication(id, body.adminComments);
  }
}