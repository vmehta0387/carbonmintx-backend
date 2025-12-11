import { Controller, Post, Get, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Post(':projectId')
  @Roles(UserRole.PROJECT_OWNER)
  @UseInterceptors(FileInterceptor('document'))
  createReport(@Param('projectId') projectId: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.monitoringService.createReport(projectId, body, file);
  }

  @Get(':projectId')
  getReports(@Param('projectId') projectId: string) {
    return this.monitoringService.getReports(projectId);
  }

  @Post('verify/:reportId')
  @Roles(UserRole.VALIDATOR)
  verifyReport(@Param('reportId') reportId: string, @Body() body: { validatorId: string }) {
    return this.monitoringService.verifyReport(reportId, body.validatorId);
  }
}
