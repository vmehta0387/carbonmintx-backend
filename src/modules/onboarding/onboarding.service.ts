import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async setUserRole(userId: string, role: string) {
    // Only allow user-selectable roles, not ADMIN
    const allowedRoles = ['PROJECT_OWNER', 'VALIDATOR', 'BUYER'];
    
    if (!allowedRoles.includes(role)) {
      throw new Error('Invalid role. Only PROJECT_OWNER, VALIDATOR, and BUYER roles are allowed during signup.');
    }
    
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any }
    });
  }

  async saveProfile(userId: string, profileData: any) {
    const { fullName, email, phone, country } = profileData;
    
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: { fullName, email, phone, country },
      create: { userId, fullName, email, phone, country }
    });
  }

  async acceptPolicies(userId: string, policies: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    const policyData = {
      userId,
      termsOfUse: policies.termsOfUse,
      climateCompliance: policies.climateCompliance,
      antiFraud: policies.antiFraud,
      doubleCountingPrevention: policies.doubleCountingPrevention,
      blockchainIrreversible: policies.blockchainIrreversible,
      privacyDataUsage: policies.privacyDataUsage,
      projectOwnerAuthenticity: user.role === 'PROJECT_OWNER' ? policies.projectOwnerAuthenticity : null,
      validatorEthics: user.role === 'VALIDATOR' ? policies.validatorEthics : null
    };

    return this.prisma.userPolicies.upsert({
      where: { userId },
      update: policyData,
      create: policyData
    });
  }

  async submitKYC(userId: string, kycData: any) {
    return this.prisma.kYC.upsert({
      where: { userId },
      update: kycData,
      create: { userId, ...kycData }
    });
  }

  async submitValidatorDocs(userId: string, validatorData: any, file: Express.Multer.File) {
    const uploadDir = join(process.cwd(), 'uploads', 'validators', userId);
    await mkdir(uploadDir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, file.buffer);
    
    const documentUrl = `/uploads/validators/${userId}/${filename}`;
    
    return this.prisma.validatorDocuments.upsert({
      where: { userId },
      update: { ...validatorData, documentUrl },
      create: { userId, ...validatorData, documentUrl }
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true }
    });
  }

  async getOnboardingStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        policies: true,
        kyc: true,
        validatorDocs: true
      }
    });

    return {
      hasRole: !!user.role,
      hasProfile: !!user.profile,
      hasPolicies: !!user.policies,
      hasKYC: !!user.kyc,
      hasValidatorDocs: user.role === 'VALIDATOR' ? !!user.validatorDocs : true,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role
    };
  }

  async getPolicies(userRole?: string) {
    const policies = {
      termsOfUse: {
        title: "Platform Terms of Use",
        content: "By using CarbonExchange, you agree to: (1) Use the platform only for legitimate carbon credit transactions, (2) Provide accurate information in all submissions, (3) Comply with all applicable laws and regulations, (4) Not engage in fraudulent activities, (5) Respect intellectual property rights, (6) Accept that we may suspend accounts for violations, (7) Understand that blockchain transactions are final and irreversible."
      },
      platformFees: {
        title: "Platform Fees & Charges",
        content: "CarbonExchange charges the following fees: (1) Project Registration: Free for initial submission, (2) Validation Fee: 2% of estimated credit value (paid to validators), (3) Marketplace Transaction Fee: 2.5% per sale (1.5% platform fee + 1% blockchain gas coverage), (4) Credit Minting: Gas fees only (paid to blockchain network), (5) Credit Retirement: Free (gas fees apply). All fees are transparently displayed before transactions. Validators receive 80% of validation fees. Platform fees support infrastructure, security, and continuous improvement."
      },
      climateCompliance: {
        title: "Climate Compliance Policy",
        content: "All carbon credits on this platform must: (1) Represent real, additional, permanent, and verifiable carbon reductions, (2) Follow recognized standards (Verra VCS, Gold Standard, CDM, CAR, ACR, Plan Vivo), (3) Include proper baseline and monitoring methodologies, (4) Undergo third-party validation and verification, (5) Not be double-counted across different registries or jurisdictions."
      },
      antiFraud: {
        title: "Anti-Fraud & Misrepresentation Policy",
        content: "Users must not: (1) Submit false or misleading project information, (2) Inflate carbon reduction estimates, (3) Use fake documents or certifications, (4) Misrepresent project ownership or rights, (5) Create duplicate projects across platforms, (6) Manipulate monitoring data or reports. Violations result in immediate account suspension and legal action."
      },
      doubleCountingPrevention: {
        title: "Double-Counting Prevention Policy",
        content: "To prevent double-counting: (1) Each carbon credit represents a unique ton of CO2 reduced/removed, (2) Credits cannot be sold on multiple platforms simultaneously, (3) Retired credits cannot be resold or transferred, (4) Projects must declare all other registry listings, (5) We maintain cross-registry checks where possible, (6) Users must warrant exclusive rights to credits being listed."
      },
      blockchainIrreversible: {
        title: "Blockchain Transactions are Irreversible Policy",
        content: "Important: All blockchain transactions (minting, transfers, purchases, retirements) are permanent and cannot be reversed. Before confirming any transaction: (1) Verify all details are correct, (2) Ensure you have sufficient funds for gas fees, (3) Understand that failed transactions may still consume gas, (4) Double-check recipient addresses, (5) Confirm transaction amounts. We cannot recover funds from incorrect transactions."
      },
      privacyDataUsage: {
        title: "Privacy & Data Usage Policy",
        content: "We collect and use your data to: (1) Verify your identity and project ownership, (2) Process carbon credit transactions, (3) Comply with regulatory requirements, (4) Prevent fraud and ensure platform security, (5) Improve our services. Your wallet address and transactions are public on the blockchain. We do not sell personal data to third parties. You can request data deletion subject to legal retention requirements."
      },
      feesAcknowledgment: {
        title: "Fee Acknowledgment",
        content: "I acknowledge and accept the platform fees structure outlined above. I understand that: (1) All fees are clearly displayed before each transaction, (2) Blockchain gas fees are variable and paid directly to the network, (3) Platform fees are non-refundable once transactions are completed, (4) Fee structures may be updated with 30 days notice to users."
      }
    };

    // Add role-specific policies
    if (userRole === 'PROJECT_OWNER') {
      policies['projectOwnerAuthenticity'] = {
        title: "Project Owner Authenticity Policy",
        content: "As a Project Owner, you warrant that: (1) You have legal rights to the project and carbon credits, (2) All project documentation is accurate and complete, (3) You will provide ongoing monitoring reports as required, (4) You will not sell the same credits on other platforms, (5) You will cooperate with validation and verification processes, (6) You understand that false claims may result in legal liability."
      };
    }

    if (userRole === 'VALIDATOR') {
      policies['validatorEthics'] = {
        title: "Validator Ethics Policy",
        content: "As a Validator, you agree to: (1) Conduct impartial and thorough project reviews, (2) Disclose any conflicts of interest, (3) Follow established validation methodologies, (4) Provide detailed findings and recommendations, (5) Maintain confidentiality of project information, (6) Not accept payments outside the platform, (7) Report suspected fraud immediately, (8) Maintain professional standards and certifications."
      };
    }

    return policies;
  }
}