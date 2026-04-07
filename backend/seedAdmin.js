const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'password'; // Use 'admin123' or similar
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  try {
    const admin = await prisma.admin.upsert({
      where: { username },
      update: { password_hash },
      create: {
        username,
        password_hash,
      },
    });
    console.log('Admin created/updated:', admin.username);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
