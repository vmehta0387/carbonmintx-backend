import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ValidatorApplicationService {
  constructor(private prisma: PrismaService) {}

  async submitApplication(applicationData: any, file: Express.Multer.File) {
    const uploadDir = join(process.cwd(), 'uploads', 'validator-applications');
    await mkdir(uploadDir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, file.buffer);
    
    const documentUrl = `/uploads/validator-applications/${filename}`;
    
    console.log('Creating validator application:', applicationData);
    
    return this.prisma.validatorApplication.create({
      data: {
        fullName: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone || null,
        walletAddress: applicationData.walletAddress || null,
        organizationName: applicationData.organizationName,
        accreditationBody: applicationData.accreditationBody,
        certificateNumber: applicationData.certificateNumber,
        experienceYears: applicationData.experienceYears || null,
        documentUrl,
        status: 'PENDING'
      }
    });
  }

  async getPendingApplications() {
    return this.prisma.validatorApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllApplications() {
    return this.prisma.validatorApplication.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getApplicationStatus(walletAddress: string) {
    return this.prisma.validatorApplication.findFirst({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveApplication(id: string, adminComments?: string) {
    const application = await this.prisma.validatorApplication.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        adminComments,
        reviewedAt: new Date()
      }
    });

    // Check if user already exists with this wallet address
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: application.walletAddress || '' }
    });

    if (!user) {
      // Create validator user account only if doesn't exist
      user = await this.prisma.user.create({
        data: {
          walletAddress: application.walletAddress || '',
          role: 'VALIDATOR'
        }
      });
    } else {
      // Update existing user role to VALIDATOR
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'VALIDATOR' }
      });
    }

    // Create user profile
    await this.prisma.userProfile.create({
      data: {
        userId: user.id,
        fullName: application.fullName,
        email: application.email,
        phone: application.phone || '',
        country: ''
      }
    });

    // Create validator documents record
    await this.prisma.validatorDocuments.create({
      data: {
        userId: user.id,
        accreditationBody: application.accreditationBody,
        certificateNumber: application.certificateNumber,
        experienceYears: parseInt(application.experienceYears?.split('-')[0] || '0') || 0,
        documentUrl: application.documentUrl,
        status: 'APPROVED',
        adminApprovedAt: new Date()
      }
    });

    // Mark user onboarding as completed
    await this.prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true }
    });

    return { application, user };
  }

  async rejectApplication(id: string, adminComments: string) {
    return this.prisma.validatorApplication.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        adminComments,
        reviewedAt: new Date()
      }
    });
  }
}