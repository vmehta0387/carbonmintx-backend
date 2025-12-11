import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MethodologyController } from './methodology.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ProjectsController, MethodologyController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
