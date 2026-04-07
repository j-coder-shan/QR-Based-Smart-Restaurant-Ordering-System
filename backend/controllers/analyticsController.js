const prisma = require('../prismaClient');

exports.getSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrdersToday, totalRevenueToday, pendingOrders, completedOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today }, status: { not: 'Cancelled' } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, is_paid: true },
        _sum: { total_amount: true }
      }),
      prisma.order.count({ where: { status: 'Pending' } }),
      prisma.order.count({ where: { status: 'Completed' } })
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
  try {
    const { startDate, endDate } = req.query;
    
    let start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const revenue = await prisma.order.findMany({
      where: {
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
  try {
    const items = await prisma.menuItem.findMany({
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
  try {
    const stats = await prisma.menuItem.groupBy({
      by: ['category'],
      _sum: { total_orders: true, total_revenue: true }
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
