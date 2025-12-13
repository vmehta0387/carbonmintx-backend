const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Delete in correct order to avoid foreign key constraints
    await prisma.certificate.deleteMany({});
    console.log('✅ Cleared certificates');

    await prisma.purchase.deleteMany({});
    console.log('✅ Cleared purchases');

    await prisma.listing.deleteMany({});
    console.log('✅ Cleared listings');

    await prisma.creditBatch.deleteMany({});
    console.log('✅ Cleared credit batches');

    await prisma.monitoringReport.deleteMany({});
    console.log('✅ Cleared monitoring reports');

    await prisma.validation.deleteMany({});
    console.log('✅ Cleared validations');

    await prisma.document.deleteMany({});
    console.log('✅ Cleared documents');

    await prisma.project.deleteMany({});
    console.log('✅ Cleared projects');

    await prisma.validatorApplication.deleteMany({});
    console.log('✅ Cleared validator applications');

    await prisma.validatorDocuments.deleteMany({});
    console.log('✅ Cleared validator documents');

    await prisma.kYC.deleteMany({});
    console.log('✅ Cleared KYC records');

    await prisma.userPolicies.deleteMany({});
    console.log('✅ Cleared user policies');

    await prisma.userProfile.deleteMany({});
    console.log('✅ Cleared user profiles');

    await prisma.user.deleteMany({});
    console.log('✅ Cleared users');

    console.log('🎉 Database cleared successfully!');
    console.log('📊 All tables are now empty');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();