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
    const restaurantId = session.table.restaurant_id;

    // EXECUTE ATOMIC TRANSACTION
    const order = await prisma.$transaction(async (tx) => {
        // 1. Update Stocks and validate availability
        for (const item of items) {
            const menuItem = await tx.menuItem.findFirst({
                where: { id: item.menu_item_id, restaurant_id: restaurantId }
            });

            if (!menuItem || !menuItem.is_available || menuItem.stock < item.quantity) {
                throw new Error(`Item ${menuItem?.name || item.menu_item_id} is unavailable or out of stock.`);
            }

            const subtotal = Number(menuItem.price) * item.quantity;
            totalAmount += subtotal;

            orderItemsData.push({
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                unit_price: menuItem.price,
                subtotal: subtotal
            });

            await tx.menuItem.update({
                where: { id: menuItem.id },
                data: { 
                    stock: menuItem.stock - item.quantity,
                    is_available: menuItem.stock - item.quantity > 0,
                    total_orders: menuItem.total_orders + item.quantity,
                    total_revenue: { increment: subtotal }
                }
            });
        }

        // 2. Create Order
        return await tx.order.create({
            data: {
                restaurant_id: restaurantId,
                table_id: session.table_id,
                session_id: session.id,
                total_amount: totalAmount,
                status: 'Pending',
                orderItems: { create: orderItemsData }
            },
            include: {
                table: true,
                orderItems: { include: { menuItem: true } }
            }
        });
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order_id: order.id,
      total_amount: totalAmount
    });

  } catch (error) {
    const statusCode = error.message.includes('unavailable') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  const { startDate, endDate } = req.query;
  const { restaurantId } = req;
  try {
    const where = { restaurant_id: restaurantId };
    
    if (startDate || endDate) {
      where.createdAt = {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined
      };
    }

    const orders = await prisma.order.findMany({
      where,
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
  const { restaurantId } = req; // Optional if customer, but here assumed admin lookup
  try {
    const order = await prisma.order.findFirst({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId // STRICTOR: restaurantId is now mandatory for security
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Smart ETA Calculation (scoped to restaurant)
    const activeOrders = await prisma.order.count({
        where: { 
            status: { in: ['Pending', 'Accepted', 'Preparing'] },
            restaurant_id: order.restaurant_id
        }
    });

    const maxPrepTime = Math.max(...order.orderItems.map(oi => oi.menuItem.prep_time || 15));
    const estimatedTime = maxPrepTime + (activeOrders * 2);

    res.json({ ...order, estimated_time: estimatedTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { restaurantId } = req;

  const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const order = await prisma.order.update({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId
      },
      data: { status },
      include: { table: true }
    });

    if (req.io) {
      req.io.to(`restaurant-${restaurantId}`).emit('orderStatusUpdate', order);
    }

    res.json({ message: 'Status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
