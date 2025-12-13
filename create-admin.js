const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminWallet = '0x49432dF037dCDe0ddcff782112EE07505D16aa07';
    
    console.log('🔍 Checking for existing admin user...');
    
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: adminWallet }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists');
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { walletAddress: adminWallet },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated user role to ADMIN');
      }
    } else {
      console.log('🔄 Creating new admin user...');
      
      await prisma.user.create({
        data: {
          walletAddress: adminWallet,
          role: 'ADMIN',
          onboardingCompleted: true
        }
      });
      
      console.log('✅ Admin user created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();