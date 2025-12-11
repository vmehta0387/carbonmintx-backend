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
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) throw new UnauthorizedException('Invalid signature');

    let user = await this.prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await this.prisma.user.create({ data: { walletAddress } });
    }

    const payload = { sub: user.id, walletAddress: user.walletAddress, role: user.role };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async signup(data: { walletAddress: string; signature: string; message: string }) {
    const isValid = await verifyMessage({
      address: data.walletAddress as `0x${string}`,
      message: data.message,
      signature: data.signature as `0x${string}`,
    });

    if (!isValid) throw new UnauthorizedException('Invalid signature');

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
