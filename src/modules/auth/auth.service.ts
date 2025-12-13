import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { verifyMessage } from 'viem';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginWallet(walletAddress: string, signature: string, message: string) {
    try {
      // Ensure signature is properly formatted
      const formattedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;
      
      const isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: formattedSignature as `0x${string}`,
      });

      if (!isValid) throw new UnauthorizedException('Invalid signature');
    } catch (error) {
      console.error('Signature verification error:', error);
      throw new UnauthorizedException('Invalid signature format');
    }

    let user = await this.prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      // Check if user has a pending validator application
      const validatorApp = await this.prisma.validatorApplication.findFirst({
        where: { walletAddress },
        orderBy: { createdAt: 'desc' }
      });
      
      if (validatorApp && validatorApp.status === 'PENDING') {
        throw new UnauthorizedException('Validator application pending approval');
      }
      
      throw new UnauthorizedException('User not found');
    }

    // If user exists but has no role and has pending validator application
    if (!user.role) {
      const validatorApp = await this.prisma.validatorApplication.findFirst({
        where: { walletAddress },
        orderBy: { createdAt: 'desc' }
      });
      
      if (validatorApp && validatorApp.status === 'PENDING') {
        throw new UnauthorizedException('Validator application pending approval');
      }
    }

    const payload = { sub: user.id, walletAddress: user.walletAddress, role: user.role };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async signup(data: { walletAddress: string; signature: string; message: string }) {
    try {
      // Ensure signature is properly formatted
      const formattedSignature = data.signature.startsWith('0x') ? data.signature : `0x${data.signature}`;
      
      const isValid = await verifyMessage({
        address: data.walletAddress as `0x${string}`,
        message: data.message,
        signature: formattedSignature as `0x${string}`,
      });

      if (!isValid) throw new UnauthorizedException('Invalid signature');
    } catch (error) {
      console.error('Signature verification error:', error);
      throw new UnauthorizedException('Invalid signature format');
    }

    let user = await this.prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    
    if (user) {
      // If user exists but onboarding is not completed, allow them to continue
      if (!user.onboardingCompleted) {
        const payload = { sub: user.id, walletAddress: user.walletAddress, role: user.role };
        return { token: this.jwtService.sign(payload), user };
      }
      // If onboarding is completed, they should use login instead
      throw new UnauthorizedException('User already exists. Please use login instead.');
    }

    // Create new user
    user = await this.prisma.user.create({
      data: {
        walletAddress: data.walletAddress,
      },
    });

    const payload = { sub: user.id, walletAddress: user.walletAddress, role: user.role };
    return { token: this.jwtService.sign(payload), user };
  }
}
