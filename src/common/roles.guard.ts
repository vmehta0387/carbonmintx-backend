import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('User from request:', request.user);
    
    if (!request.user?.id) {
      console.log('No user ID in request');
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: request.user.id }
    });

    console.log('User role:', user?.role, 'Required roles:', requiredRoles);
    const hasRole = requiredRoles.includes(user?.role);
    console.log('Has required role:', hasRole);
    
    return hasRole;
  }
}