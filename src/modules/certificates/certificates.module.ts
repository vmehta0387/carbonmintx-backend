import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  providers: [CertificatesService, PrismaService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
