import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ProjectsService } from '../projects/projects.service';
import { ProjectStatus, ValidationStatus } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ValidationService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private projectsService: ProjectsService,
  ) {}

  async startReview(projectId: string, validatorId: string) {
    const validation = await this.prisma.validation.create({
      data: { projectId, validatorId, status: ValidationStatus.IN_REVIEW },
    });
    await this.projectsService.updateProjectStatus(projectId, ProjectStatus.UNDER_VALIDATION);
    return validation;
  }

  async submitValidationReport(validationId: string, data: any, file?: Express.Multer.File) {
    let reportUrl = null;
    if (file) {
      const uploadDir = join(process.cwd(), 'uploads', 'validation');
      await mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${file.originalname}`;
      await writeFile(join(uploadDir, filename), file.buffer);
      reportUrl = `/uploads/validation/${filename}`;
    }

    return this.prisma.validation.update({
      where: { id: validationId },
      data: {
        findings: data.findings,
        recommendations: data.recommendations,
        comments: data.comments,
        reportUrl,
      },
    });
  }

  async approveProject(validationId: string) {
    const validation = await this.prisma.validation.update({
      where: { id: validationId },
      data: { status: ValidationStatus.APPROVED },
      include: { project: true },
    });

    await this.projectsService.updateProjectStatus(validation.projectId, ProjectStatus.APPROVED);
    return validation;
  }

  async rejectProject(validationId: string, comments: string) {
    const validation = await this.prisma.validation.update({
      where: { id: validationId },
      data: { status: ValidationStatus.REJECTED, comments },
      include: { project: true },
    });

    await this.projectsService.updateProjectStatus(validation.projectId, ProjectStatus.REJECTED);
    return validation;
  }

  async requestCorrections(validationId: string, comments: string) {
    const validation = await this.prisma.validation.update({
      where: { id: validationId },
      data: { status: ValidationStatus.CORRECTIONS_REQUESTED, comments },
      include: { project: true },
    });
    await this.projectsService.updateProjectStatus(validation.projectId, ProjectStatus.REJECTED);
    return validation;
  }

  async resubmitProject(projectId: string) {
    await this.projectsService.updateProjectStatus(projectId, ProjectStatus.SUBMITTED);
    return { message: 'Project resubmitted for validation' };
  }

  async mintCredits(projectId: string) {
    const project = await this.prisma.project.findUnique({ 
      where: { id: projectId },
      include: { owner: true, monitoringReports: true }
    });

    if (project.status !== ProjectStatus.APPROVED) {
      throw new Error('Project must be approved before minting');
    }

    const verifiedReports = project.monitoringReports.filter(r => r.status === 'VERIFIED');
    if (verifiedReports.length === 0) {
      throw new Error('No verified monitoring reports found');
    }

    const totalReduction = verifiedReports.reduce((sum, r) => sum + r.actualReduction, 0);
    
    const tokenId = await this.blockchainService.mintCredits(
      project.owner.walletAddress,
      totalReduction,
      projectId
    );

    await this.projectsService.updateProjectStatus(projectId, ProjectStatus.MINTED, tokenId.toString());
    return { tokenId, amount: totalReduction };
  }

  async getValidation(projectId: string) {
    return this.prisma.validation.findFirst({
      where: { projectId },
      include: { validator: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getValidationHistory(projectId: string) {
    return this.prisma.validation.findMany({
      where: { projectId },
      include: { validator: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
