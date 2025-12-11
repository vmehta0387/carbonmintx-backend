import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.PROJECT_OWNER)
  @UseInterceptors(FilesInterceptor('documents'))
  async createProject(@Request() req, @Body() body: any, @UploadedFiles() files: Express.Multer.File[]) {
    const project = await this.projectsService.createProject(req.user.id, body);
    
    if (files && files.length > 0) {
      const docsWithTypes = files.map((file, i) => ({
        file,
        type: body[`documents[${i}][type]`] || 'OTHER'
      }));
      await this.projectsService.uploadDocuments(project.id, docsWithTypes);
    }
    
    return project;
  }

  @Post(':id/documents')
  @Roles(UserRole.PROJECT_OWNER)
  @UseInterceptors(FilesInterceptor('files'))
  uploadDocuments(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    const docsWithTypes = files.map((file, i) => ({
      file,
      type: body[`type_${i}`] || 'OTHER'
    }));
    return this.projectsService.uploadDocuments(id, docsWithTypes);
  }

  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Get()
  getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @Patch(':id')
  @Roles(UserRole.PROJECT_OWNER, UserRole.ADMIN)
  updateProject(@Param('id') id: string, @Body() body: { description?: string; additionalityProof?: string }) {
    return this.projectsService.updateProject(id, body);
  }
}
