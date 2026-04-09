require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed Admin
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: hashedPassword,
    },
  });
  console.log(`Created admin user with username: ${admin.username}`);

  // Seed Tables
  const tables = [
    { table_number: 'T01', qr_token: 'TOKEN_T01_XYZ', capacity: 2 },
    { table_number: 'T02', qr_token: 'TOKEN_T02_ABC', capacity: 4 },
    { table_number: 'T03', qr_token: 'TOKEN_T03_DEF', capacity: 6 },
  ];

  for (const t of tables) {
    const table = await prisma.table.upsert({
      where: { table_number: t.table_number },
      update: {},
      create: t,
    });
    console.log(`Created table: ${table.table_number}`);
  }

  // Seed Menu
  const menuItems = [
    { name: 'Special Fried Rice', price: 12.99, category: 'Rice', stock: 50 },
    { name: 'Chicken Curry', price: 15.50, category: 'Curry', stock: 30 },
    { name: 'Mango Lassi', price: 4.50, category: 'Drinks', stock: 100 },
  ];

  for (const m of menuItems) {
    const item = await prisma.menuItem.create({
      data: m,
    });
    console.log(`Created menu item: ${item.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
