import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async createReport(projectId: string, data: any, file: Express.Multer.File) {
    const uploadDir = join(process.cwd(), 'uploads', 'monitoring');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, file.buffer);

    return this.prisma.monitoringReport.create({
      data: {
        projectId,
        reportingPeriod: data.reportingPeriod,
        actualReduction: parseInt(data.actualReduction),
        documentUrl: `/uploads/monitoring/${filename}`,
      },
    });
  }

  async getReports(projectId: string) {
    return this.prisma.monitoringReport.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyReport(reportId: string, validatorId: string, comments?: string) {
    return this.prisma.monitoringReport.update({
      where: { id: reportId },
      data: {
        status: 'VERIFIED',
        verifiedBy: validatorId,
        verificationDate: new Date(),
      },
    });
  }

  async rejectReport(reportId: string, validatorId: string, comments?: string) {
    return this.prisma.monitoringReport.update({
      where: { id: reportId },
      data: {
        status: 'REJECTED',
        verifiedBy: validatorId,
        verificationDate: new Date(),
      },
    });
  }
}
