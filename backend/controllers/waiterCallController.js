const prisma = require('../prismaClient');

exports.createWaiterCall = async (req, res) => {
  const { session_id } = req.body;
  try {
    const session = await prisma.session.findUnique({
      where: { 
          id: parseInt(session_id) || undefined, 
          session_id: String(session_id).includes('-') ? session_id : undefined 
      },
      include: { table: true, restaurant: true }
    });

    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive session' });
    }

    if (session.restaurant.status === 'BLOCKED') {
        return res.status(403).json({ error: 'This restaurant service is currently unavailable.' });
    }

    const restaurantId = session.restaurant_id;

    const call = await prisma.waiterCall.create({
      data: {
        restaurant_id: restaurantId,
        table_id: session.table_id,
        session_id: session.id
      },
      include: { table: true }
    });

    if (req.io) {
      req.io.to(`restaurant-${restaurantId}`).emit('newWaiterCall', call);
    }

    res.status(201).json({ message: 'Waiter has been notified', call: call });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllWaiterCalls = async (req, res) => {
  const { restaurantId } = req;
  try {
    const calls = await prisma.waiterCall.findMany({
      where: { 
          restaurant_id: restaurantId,
          status: 'Pending' 
      },
      include: { table: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveWaiterCall = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  try {
    const call = await prisma.waiterCall.update({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId
      },
      data: { status: 'Resolved' }
    });

    if (req.io) {
      req.io.to(`restaurant-${restaurantId}`).emit('waiterCallResolved', { id: parseInt(id) });
    }

    res.json({ message: 'Call resolved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
