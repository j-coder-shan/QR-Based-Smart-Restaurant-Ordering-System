const prisma = require('../prismaClient');

exports.getSummary = async (req, res) => {
  const { restaurantId } = req;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrdersToday, totalRevenueToday, pendingOrders, completedOrders] = await Promise.all([
      prisma.order.count({ 
          where: { 
              restaurant_id: restaurantId,
              createdAt: { gte: today }, 
              status: { not: 'Cancelled' } 
          } 
      }),
      prisma.order.aggregate({
        where: { 
            restaurant_id: restaurantId,
            createdAt: { gte: today }, 
            is_paid: true 
        },
        _sum: { total_amount: true }
      }),
      prisma.order.count({ 
          where: { 
              restaurant_id: restaurantId,
              status: 'Pending' 
          } 
      }),
      prisma.order.count({ 
          where: { 
              restaurant_id: restaurantId,
              status: 'Completed' 
          } 
      })
    ]);

    res.json({
      totalOrdersToday,
      totalRevenueToday: totalRevenueToday._sum.total_amount || 0,
      pendingOrders,
      completedOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRevenueData = async (req, res) => {
  const { restaurantId } = req;
  try {
    const { startDate, endDate } = req.query;
    
    let start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const revenue = await prisma.order.findMany({
      where: {
        restaurant_id: restaurantId,
        createdAt: { gte: start, lte: end },
        is_paid: true
      },
      select: {
        total_amount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const grouped = revenue.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(curr.total_amount);
      return acc;
    }, {});

    // Generate full list of dates in range
    const chartData = [];
    const currDate = new Date(start);
    while (currDate <= end) {
      const dateStr = currDate.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        revenue: grouped[dateStr] || 0
      });
      currDate.setDate(currDate.getDate() + 1);
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPopularItems = async (req, res) => {
  const { restaurantId } = req;
  try {
    const items = await prisma.menuItem.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { total_orders: 'desc' },
      take: 5,
      select: { name: true, total_orders: true, category: true }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  const { restaurantId } = req;
  try {
    const stats = await prisma.menuItem.groupBy({
      where: { restaurant_id: restaurantId },
      by: ['category'],
      _sum: { total_orders: true, total_revenue: true }
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDailyForecast = async (req, res) => {
  const { restaurantId } = req;
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurant_id: restaurantId,
          createdAt: { gte: sixMonthsAgo },
          status: 'Completed'
        }
      },
      include: {
        order: true,
        menuItem: true
      }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const acc = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };
    const uniqueDates = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set() };

    orderItems.forEach(item => {
      const day = item.order.createdAt.getDay();
      const dateStr = item.order.createdAt.toISOString().split('T')[0];
      const itemName = item.menuItem.name;

      acc[day][itemName] = (acc[day][itemName] || 0) + item.quantity;
      uniqueDates[day].add(dateStr);
    });

    const result = days.map((dayName, index) => {
      const dayItems = acc[index];
      const occurrenceCount = uniqueDates[index].size || 1;

      const processedItems = Object.keys(dayItems).map(itemName => ({
        name: itemName,
        avg: parseFloat((dayItems[itemName] / occurrenceCount).toFixed(1))
      }));

      processedItems.sort((a, b) => b.avg - a.avg);
      
      return {
        day: dayName,
        topItems: processedItems.slice(0, 3)
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
