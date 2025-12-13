import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { 
        profile: true,
        kyc: true,
        policies: true,
        validatorDocs: true
      }
    });
  }

  async updateRole(userId: string, role: UserRole) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async updateProfile(userId: string, data: any) {
    const { companyName, companyType, industry, contactPerson, gstNumber, panNumber, cinNumber, billingAddress, esgContact, ...userData } = data;
    
    console.log('Updating user data:', userData);
    console.log('Updating KYC data:', { companyName, companyType, industry, contactPerson, gstNumber, panNumber, cinNumber, billingAddress, esgContact });
    
    // Update user basic data
    const user = await this.prisma.user.update({ 
      where: { id: userId }, 
      data: userData 
    });
    
    // Update or create profile data
    if (userData.fullName || userData.email || userData.phone || userData.country) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country
        },
        update: {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          country: userData.country
        }
      });
    }
    
    // Update or create KYC data if company fields provided
    if (companyName || companyType || industry) {
      await this.prisma.kYC.upsert({
        where: { userId },
        create: {
          userId,
          companyName: companyName || '',
          companyType,
          industry,
          contactPerson,
          gstNumber,
          panNumber,
          cinNumber,
          billingAddress,
          esgContact
        },
        update: {
          companyName,
          companyType,
          industry,
          contactPerson,
          gstNumber,
          panNumber,
          cinNumber,
          billingAddress,
          esgContact
        }
      });
    }
    
    return user;
  }

  async updateKYCStatus(userId: string, status: string) {
    return this.prisma.kYC.update({
      where: { userId },
      data: { status }
    });
  }

  async getPendingKYC() {
    // Debug: Check all KYC records
    const allKYC = await this.prisma.kYC.findMany();
    console.log('All KYC records:', allKYC);
    
    const pendingUsers = await this.prisma.user.findMany({
      where: {
        kyc: {
          status: 'PENDING'
        }
      },
      include: {
        kyc: true,
        profile: true
      }
    });
    
    console.log('Pending KYC users:', pendingUsers);
    return pendingUsers;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        kyc: true,
        policies: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
