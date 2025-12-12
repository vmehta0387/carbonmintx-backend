const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        walletAddress: '0x49432dF037dCDe0ddcff782112EE07505D16aa07',
        role: 'ADMIN',
        fullName: 'CarbonMintX Admin',
        email: 'admin@carbonmintx.com',
        phone: '+1-555-0123',
        country: 'United States',
        onboardingCompleted: true
      }
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();