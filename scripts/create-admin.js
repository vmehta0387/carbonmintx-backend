const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  const walletAddress = process.argv[2];
  
  if (!walletAddress) {
    console.log('Usage: node scripts/create-admin.js <wallet_address>');
    console.log('Example: node scripts/create-admin.js 0x1234567890123456789012345678901234567890');
    process.exit(1);
  }

  try {
    const user = await prisma.user.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        role: 'ADMIN',
        fullName: 'Super Admin',
        onboardingCompleted: true
      },
      update: {
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created/updated successfully:');
    console.log(`   Wallet: ${user.walletAddress}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();