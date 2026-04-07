const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('📦 Starting backup of legacy data via Raw SQL...');
  
  // Using Raw SQL because the current Prisma Client doesn't match the DB state
  const tables = await prisma.$queryRawUnsafe(`SELECT * FROM "tables"`);
  const menuItems = await prisma.$queryRawUnsafe(`SELECT * FROM "menu_items"`);
  const categories = await prisma.$queryRawUnsafe(`SELECT * FROM "categories"`);
  const orders = await prisma.$queryRawUnsafe(`SELECT * FROM "orders"`);
  const orderItems = await prisma.$queryRawUnsafe(`SELECT * FROM "order_items"`);
  const waiterCalls = await prisma.$queryRawUnsafe(`SELECT * FROM "waiter_calls"`);
  const feedback = await prisma.$queryRawUnsafe(`SELECT * FROM "feedback"`);
  const admins = await prisma.$queryRawUnsafe(`SELECT * FROM "admins"`);

  const backup = {
    tables,
    menuItems,
    categories,
    orders,
    orderItems,
    waiterCalls,
    feedback,
    admins
  };

  fs.writeFileSync('legacy_backup.json', JSON.stringify(backup, null, 2));
  console.log('✅ Backup completed! Saved to legacy_backup.json');
}

main()
  .catch((e) => {
    console.error('❌ Backup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
