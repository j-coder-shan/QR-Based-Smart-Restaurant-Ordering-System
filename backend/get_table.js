const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const table = await prisma.table.findFirst();
  console.log(JSON.stringify(table, null, 2));
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
