const prisma = require('../prismaClient');

exports.createWaiterCall = async (req, res) => {
  const { session_id } = req.body;
  try {
    const session = await prisma.session.findUnique({
      where: { session_id: session_id }
    });

    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive session' });
    }

    const call = await prisma.waiterCall.create({
      data: {
        table_id: session.table_id,
        session_id: session.id
      }
    });

    res.status(201).json({ message: 'Waiter has been notified', call_id: call.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllWaiterCalls = async (req, res) => {
  try {
    const calls = await prisma.waiterCall.findMany({
      where: { status: 'Pending' },
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
  try {
    await prisma.waiterCall.update({
      where: { id: parseInt(id) },
      data: { status: 'Resolved' }
    });
    res.json({ message: 'Call resolved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
