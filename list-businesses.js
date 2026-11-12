import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listBusinesses() {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        ownerName: true,
        industry: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n=== ALL BUSINESSES ===\n');
    businesses.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   ID: ${b.id}`);
      console.log(`   Email: ${b.email}`);
      console.log(`   Owner: ${b.ownerName || 'N/A'}`);
      console.log(`   Industry: ${b.industry || 'N/A'}`);
      console.log(`   Created: ${b.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

listBusinesses();
