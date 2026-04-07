const prisma = require('../prismaClient');

exports.createOrder = async (req, res) => {
  const { session_id, items } = req.body;

  try {
    const session = await prisma.session.findUnique({
      where: { session_id: session_id },
      include: { table: true }
    });

    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Session is inactive or invalid. Cannot place order.' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menu_item_id }
      });

      if (!menuItem || !menuItem.is_available || menuItem.stock < item.quantity) {
        return res.status(400).json({ error: `Item ${menuItem?.name || item.menu_item_id} is unavailable or out of stock.` });
      }

      const subtotal = Number(menuItem.price) * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
        subtotal: subtotal
      });

      // Update Stock
      await prisma.menuItem.update({
        where: { id: menuItem.id },
        data: { 
          stock: menuItem.stock - item.quantity,
          is_available: menuItem.stock - item.quantity > 0,
          total_orders: menuItem.total_orders + item.quantity,
          total_revenue: { increment: subtotal }
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        table_id: session.table_id,
        session_id: session.id,
        total_amount: totalAmount,
        status: 'Pending',
        orderItems: {
          create: orderItemsData
        }
      }
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order_id: order.id,
      total_amount: totalAmount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Add Smart ETA Calculation (Phase 8 logic)
    const activeOrders = await prisma.order.count({
        where: { status: { in: ['Pending', 'Accepted', 'Preparing'] } }
    });

    const maxPrepTime = Math.max(...order.orderItems.map(oi => oi.menuItem.prep_time || 15));
    const multiplier = process.env.ETA_MULTIPLIER || 2;
    const estimatedTime = maxPrepTime + (activeOrders * multiplier);

    res.json({ ...order, estimated_time: estimatedTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ message: 'Status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
