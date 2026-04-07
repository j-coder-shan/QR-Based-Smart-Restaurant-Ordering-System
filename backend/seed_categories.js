const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } }
  });

  for (const item of items) {
    if (item.category) {
      await prisma.category.upsert({
        where: { name: item.category },
        update: {},
        create: { name: item.category }
      });
      console.log(`Upserted category: ${item.category}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
