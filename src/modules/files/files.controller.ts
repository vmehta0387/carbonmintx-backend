import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class FilesController {
  @Get(':projectId/:filename')
  async getFile(
    @Param('projectId') projectId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', projectId, filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    
    return res.sendFile(filePath);
  }
}