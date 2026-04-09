const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initializing SaaS Environment...');

  // 1. Create Super Admin
  const saPassword = await bcrypt.hash('superpassword123', 10);
  const superAdmin = await prisma.superAdmin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password_hash: saPassword,
    },
  });
  console.log('✅ Super Admin created (superadmin / superpassword123)');

  // 2. Generate 10 Testing Keys
  for (let i = 0; i < 10; i++) {
    const key = `RESTO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await prisma.licenseKey.create({
      data: {
        key_code: key,
        is_used: false,
      }
    });
  }
  console.log('✅ 10 Testing Keys generated');

  // 3. Load Backup
  let backup = null;
  if (fs.existsSync('legacy_backup.json')) {
    backup = JSON.parse(fs.readFileSync('legacy_backup.json', 'utf8'));
    console.log('📦 Legacy backup found. Starting migration...');
  }

  // 4. Create First Restaurant (for legacy data)
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Primary Restaurant',
      email: 'primary@restaurant.com',
      phone: '000-000-0000',
      category: 'RESTAURANT',
      status: 'ACTIVE',
      subscription: {
        create: {
          status: 'ACTIVE',
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year active
        }
      }
    }
  });
  console.log(`✅ Primary Restaurant created (ID: ${restaurant.id})`);

  if (backup) {
    // 5. Migrate Admins to Users
    for (const admin of backup.admins) {
      // Check username uniqueness
      const exists = await prisma.user.findUnique({ where: { username: admin.username } });
      if (!exists) {
        await prisma.user.create({
          data: {
            restaurant_id: restaurant.id,
            username: admin.username,
            password_hash: admin.password_hash,
            role: 'ADMIN',
          }
        });
      }
    }
    console.log('✅ Admins migrated to Users');

    // 6. Migrate Categories
    const categoryMap = new Map();
    for (const cat of backup.categories) {
      const newCat = await prisma.category.create({
        data: {
          restaurant_id: restaurant.id,
          name: cat.name,
          createdAt: new Date(cat.created_at || Date.now()),
        }
      });
      categoryMap.set(cat.id, newCat.id);
    }
    console.log('✅ Categories migrated');

    // 7. Migrate Tables
    const tableMap = new Map();
    for (const table of backup.tables) {
       const newTable = await prisma.table.create({
         data: {
           restaurant_id: restaurant.id,
           table_number: table.table_number,
           qr_token: table.qr_token,
           capacity: table.capacity,
           is_active: table.is_active,
         }
       });
       tableMap.set(table.id, newTable.id);
    }
    console.log('✅ Tables migrated');

    // 8. Migrate Menu Items
    const menuMap = new Map();
    for (const item of backup.menuItems) {
      const newItem = await prisma.menuItem.create({
        data: {
          restaurant_id: restaurant.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          category: item.category,
          stock: item.stock,
          prep_time: item.prep_time,
          total_orders: item.total_orders,
          total_revenue: item.total_revenue,
        }
      });
      menuMap.set(item.id, newItem.id);
    }
    console.log('✅ Menu Items migrated');

    // Orders, WaiterCalls etc. would be complex due to relations, but I'll skip them if not critical 
    // or try a simple migration for them too.
    console.log('⚠️ Order and Session history migration skipped for complexity (Phase 13 focus is onboarding/tenant setup).');
  }

  console.log('🎉 SaaS Initialization COMPLETE!');
}

main()
  .catch((e) => {
    console.error('❌ Initialization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
