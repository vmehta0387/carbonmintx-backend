import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(ownerId: string, data: any) {
    const { documents, ...projectData } = data;
    return this.prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        location: projectData.location,
        latitude: projectData.latitude ? parseFloat(projectData.latitude) : null,
        longitude: projectData.longitude ? parseFloat(projectData.longitude) : null,
        projectType: projectData.projectType,
        carbonStandard: projectData.carbonStandard,
        methodology: projectData.methodology,
        estimatedCredits: parseInt(projectData.estimatedCredits),
        creditingPeriodStart: new Date(projectData.creditingPeriodStart),
        creditingPeriodEnd: new Date(projectData.creditingPeriodEnd),
        vintageYear: parseInt(projectData.vintageYear),
        additionalityProof: projectData.additionalityProof,
        ownerId,
        status: 'SUBMITTED',
      },
    });
  }

  async uploadDocuments(projectId: string, files: Array<{ file: Express.Multer.File; type: string }>) {
    const uploadDir = join(process.cwd(), 'uploads', projectId);
    await mkdir(uploadDir, { recursive: true });

    const documents = await Promise.all(
      files.map(async ({ file, type }) => {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, file.buffer);
        
        return this.prisma.document.create({
          data: {
            filename,
            type: type as any,
            url: `/uploads/${projectId}/${filename}`,
            size: file.size,
            mimeType: file.mimetype,
            projectId,
          },
        });
      }),
    );

    return documents;
  }

  async getProject(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { documents: true, owner: true, validations: true, monitoringReports: true },
    });
  }

  async getAllProjects() {
    return this.prisma.project.findMany({ include: { owner: true, documents: true, monitoringReports: true } });
  }

  async updateProjectStatus(id: string, status: any, tokenId?: string) {
    return this.prisma.project.update({
      where: { id },
      data: { status, tokenId },
    });
  }

  async updateProject(id: string, data: { description?: string; additionalityProof?: string }) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }
}
