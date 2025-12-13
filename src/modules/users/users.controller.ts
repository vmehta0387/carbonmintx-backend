import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('role')
  updateRole(@Request() req, @Body() body: { role: UserRole }) {
    return this.usersService.updateRole(req.user.id, body.role);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Patch('kyc/:userId/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  approveKYC(@Param('userId') userId: string) {
    return this.usersService.updateKYCStatus(userId, 'APPROVED');
  }

  @Patch('kyc/:userId/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  rejectKYC(@Param('userId') userId: string) {
    return this.usersService.updateKYCStatus(userId, 'REJECTED');
  }

  @Get('pending-kyc')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getPendingKYC() {
    return this.usersService.getPendingKYC();
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Patch(':userId/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateUserRole(@Param('userId') userId: string, @Body() body: { role: UserRole }) {
    return this.usersService.updateRole(userId, body.role);
  }
}
