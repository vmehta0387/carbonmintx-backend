import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationService } from './validation.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('validation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ValidationController {
  constructor(private validationService: ValidationService) {}

  @Post(':projectId/start')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  startReview(@Param('projectId') projectId: string, @Request() req) {
    return this.validationService.startReview(projectId, req.user.id);
  }

  @Post(':validationId/report')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('report'))
  submitReport(@Param('validationId') validationId: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.validationService.submitValidationReport(validationId, body, file);
  }

  @Post(':validationId/approve')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  approveProject(@Param('validationId') validationId: string) {
    return this.validationService.approveProject(validationId);
  }

  @Post(':validationId/reject')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  rejectProject(@Param('validationId') validationId: string, @Body() body: { comments: string }) {
    return this.validationService.rejectProject(validationId, body.comments);
  }

  @Post(':validationId/corrections')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  requestCorrections(@Param('validationId') validationId: string, @Body() body: { comments: string }) {
    return this.validationService.requestCorrections(validationId, body.comments);
  }

  @Post(':projectId/mint')
  @Roles(UserRole.VALIDATOR, UserRole.ADMIN)
  mintCredits(@Param('projectId') projectId: string) {
    return this.validationService.mintCredits(projectId);
  }

  @Get(':projectId')
  getValidation(@Param('projectId') projectId: string) {
    return this.validationService.getValidation(projectId);
  }

  @Get(':projectId/history')
  getValidationHistory(@Param('projectId') projectId: string) {
    return this.validationService.getValidationHistory(projectId);
  }

  @Post(':projectId/resubmit')
  @Roles(UserRole.PROJECT_OWNER)
  resubmitProject(@Param('projectId') projectId: string) {
    return this.validationService.resubmitProject(projectId);
  }
}
