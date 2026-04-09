const prisma = require('../prismaClient');

exports.getRecommendations = async (req, res) => {
  const { menu_item_id, restaurant_id } = req.query;

  try {
    if (!restaurant_id && !menu_item_id) {
        return res.status(400).json({ error: 'restaurant_id or menu_item_id is required' });
    }

    let targetRestaurantId = parseInt(restaurant_id);

    // If only menu_item_id is provided, find its restaurant
    if (menu_item_id && !targetRestaurantId) {
        const item = await prisma.menuItem.findUnique({ where: { id: parseInt(menu_item_id) } });
        if (item) targetRestaurantId = item.restaurant_id;
    }

    if (!targetRestaurantId) {
        return res.status(404).json({ error: 'Restaurant context not found' });
    }

    // 1. Popular Items (Phase 8 Statistical AI) - Scoped to Restaurant
    const popular = await prisma.menuItem.findMany({
      where: { restaurant_id: targetRestaurantId },
      orderBy: { total_orders: 'desc' },
      take: 5
    });

    // 2. Similar Items (Category Based) - Scoped to Restaurant
    let similar = [];
    if (menu_item_id) {
       const item = await prisma.menuItem.findUnique({ where: { id: parseInt(menu_item_id) } });
       if (item) {
          similar = await prisma.menuItem.findMany({
            where: { 
                restaurant_id: targetRestaurantId,
                category: item.category, 
                id: { not: item.id } 
            },
            take: 3
          });
       }
    }

    // 3. Frequently Bought Together (Phase 8 logic) - Scoped to Restaurant
    let frequent_pairs = [];
    if (menu_item_id) {
        const relatedOrders = await prisma.orderItem.findMany({
            where: { 
                menu_item_id: parseInt(menu_item_id),
                order: { restaurant_id: targetRestaurantId }
            },
            select: { order_id: true }
        });
        const orderIds = relatedOrders.map(ro => ro.order_id);
        
        frequent_pairs = await prisma.menuItem.findMany({
            where: { 
                restaurant_id: targetRestaurantId,
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
