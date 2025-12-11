import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login-wallet')
  async loginWallet(@Body() body: { walletAddress: string; signature: string; message: string }) {
    return this.authService.loginWallet(body.walletAddress, body.signature, body.message);
  }

  @Post('signup')
  async signup(@Body() body: { walletAddress: string; signature: string; message: string }) {
    return this.authService.signup(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.validateUser(req.user.id);
  }
}
