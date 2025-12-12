import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      console.log('🔄 Retrying with connection pooling...');
      
      // Retry with connection pooling
      try {
        await this.$disconnect();
        await this.$connect();
        console.log('✅ Database connected with retry');
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError.message);
        throw retryError;
      }
    }
  }
}
