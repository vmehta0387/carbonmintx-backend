const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    
    // Drop all tables in correct order (respecting foreign key constraints)
    await prisma.$executeRaw`DROP TABLE IF EXISTS "CreditBatch" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Certificate" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Purchase" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Listing" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Validation" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "MonitoringReport" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Document" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Project" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ValidatorApplication" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "ValidatorDocuments" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "KYC" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "UserPolicies" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "UserProfile" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;`;
    
    // Drop enums
    await prisma.$executeRaw`DROP TYPE IF EXISTS "UserRole" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "ProjectStatus" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "ProjectType" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "CarbonStandard" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "DocumentType" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "ListingStatus" CASCADE;`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "ValidationStatus" CASCADE;`;
    
    console.log('✅ All tables and types dropped');
    
    console.log('🔄 Pushing new schema...');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();