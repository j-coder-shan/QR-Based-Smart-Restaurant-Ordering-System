const prisma = require('../prismaClient');

exports.getRecommendations = async (req, res) => {
  const { menu_item_id } = req.query;

  try {
    // 1. Popular Items (Phase 8 Statistical AI)
    const popular = await prisma.menuItem.findMany({
      orderBy: { total_orders: 'desc' },
      take: 5
    });

    // 2. Similar Items (Category Based)
    let similar = [];
    if (menu_item_id) {
       const item = await prisma.menuItem.findUnique({ where: { id: parseInt(menu_item_id) } });
       if (item) {
          similar = await prisma.menuItem.findMany({
            where: { category: item.category, id: { not: item.id } },
            take: 3
          });
       }
    }

    // 3. Frequently Bought Together (Phase 8 logic)
    // Simplified: Look at orders containing the current item and see what else was in them
    let frequent_pairs = [];
    if (menu_item_id) {
        const relatedOrders = await prisma.orderItem.findMany({
            where: { menu_item_id: parseInt(menu_item_id) },
            select: { order_id: true }
        });
        const orderIds = relatedOrders.map(ro => ro.order_id);
        
        frequent_pairs = await prisma.menuItem.findMany({
            where: { 
                orderItems: { some: { order_id: { in: orderIds } } },
                id: { not: parseInt(menu_item_id) }
            },
            take: 3
        });
    }

    res.json({ popular, similar, frequent_pairs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
