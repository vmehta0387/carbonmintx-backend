import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ValidationModule } from './modules/validation/validation.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { MintingModule } from './modules/minting/minting.module';
import { ValidatorApplicationModule } from './modules/validator-application/validator-application.module';
import { FilesModule } from './modules/files/files.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ValidationModule,
    MarketplaceModule,
    BlockchainModule,
    CertificatesModule,
    MonitoringModule,
    OnboardingModule,
    MintingModule,
    ValidatorApplicationModule,
    FilesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
