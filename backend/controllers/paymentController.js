const prisma = require('../prismaClient');

exports.getBillSummary = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { session_id: sessionId },
      include: {
        orders: {
          where: { status: { not: 'Cancelled' } },
          include: { orderItems: { include: { menuItem: true } } }
        },
        table: true
      }
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });

    let totalAmount = 0;
    const items = [];

    session.orders.forEach(order => {
      totalAmount += Number(order.total_amount);
      order.orderItems.forEach(oi => {
        items.push({
          name: oi.menuItem.name,
          quantity: oi.quantity,
          price: oi.unit_price,
          subtotal: oi.subtotal
        });
      });
    });

    res.json({
      table_number: session.table.table_number,
      orders: session.orders,
      items: items,
      total_amount: totalAmount,
      is_active: session.is_active,
      bill_requested: session.bill_requested
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestBill = async (req, res) => {
  const { session_id } = req.body;
  try {
    const session = await prisma.session.findUnique({ where: { session_id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    await prisma.session.update({
      where: { session_id },
      data: { bill_requested: true }
    });

    res.json({ message: 'Bill requested. Waiter will be with you shortly.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBillRequests = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { bill_requested: true, is_active: true },
      include: {
        table: true,
        orders: { where: { status: { not: 'Cancelled' } } }
      }
    });

    const requests = sessions.map(s => {
      const total = s.orders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      return {
        id: s.id,
        session_id: s.session_id,
        table_number: s.table.table_number,
        total_amount: total
      };
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  const { session_id, payment_method } = req.body;

  try {
    const session = await prisma.session.findUnique({
      where: { session_id },
      include: { 
        orders: { where: { status: { not: 'Cancelled' } } } 
      }
    });

    if (!session || !session.is_active) {
      return res.status(400).json({ error: 'Inctive or non-existent session' });
    }

    const totalAmount = session.orders.reduce((acc, o) => acc + Number(o.total_amount), 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          session_id: session.id,
          total_amount: totalAmount,
          payment_method: payment_method,
          status: 'COMPLETED'
        }
      });

      // 2. Mark orders as paid
      await tx.order.updateMany({
        where: { session_id: session.id, status: { not: 'Cancelled' } },
        data: { is_paid: true, status: 'Completed' }
      });

      // 3. End Session
      await tx.session.update({
        where: { id: session.id },
        data: { is_active: false, end_time: new Date() }
      });

      return payment;
    });

    res.json({ message: 'Payment successful', payment: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
