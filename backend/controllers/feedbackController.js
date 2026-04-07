const prisma = require('../prismaClient');

exports.submitFeedback = async (req, res) => {
  const { session_id, order_id, menu_item_id, rating, comment } = req.body;
  
  try {
    // 1. Validate session
    const session = await prisma.session.findUnique({
      where: { session_id: String(session_id).includes('-') ? session_id : undefined, id: !String(session_id).includes('-') ? parseInt(session_id) : undefined },
      include: { orders: { where: { id: parseInt(order_id) } } }
    });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.is_active) return res.status(400).json({ error: 'Feedback only allowed after payment/session ends' });

    // 2. Validate order
    const order = session.orders[0];
    if (!order) return res.status(404).json({ error: 'Order not found in this session' });
    if (order.status !== 'Completed') return res.status(400).json({ error: 'Order must be completed' });

    // 3. Validate menu item
    const orderItem = await prisma.orderItem.findFirst({
      where: { order_id: parseInt(order_id), menu_item_id: parseInt(menu_item_id) }
    });
    if (!orderItem) return res.status(400).json({ error: 'Item was not part of this order' });

    // 4. Save feedback and update MenuItem stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create feedback
      const feedback = await tx.feedback.create({
        data: {
          order_id: parseInt(order_id),
          menu_item_id: parseInt(menu_item_id),
          rating: parseInt(rating),
          comment
        }
      });

      // Update MenuItem stats
      const menuItem = await tx.menuItem.findUnique({
        where: { id: parseInt(menu_item_id) }
      });

      const newReviewCount = menuItem.review_count + 1;
      const newAvgRating = (Number(menuItem.avg_rating) * menuItem.review_count + parseInt(rating)) / newReviewCount;

      await tx.menuItem.update({
        where: { id: parseInt(menu_item_id) },
        data: {
          avg_rating: newAvgRating,
          review_count: newReviewCount
        }
      });

      return feedback;
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: result });
  } catch (error) {
    if (error.code === 'P2002') {
       return res.status(400).json({ error: 'You have already submitted feedback for this item' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuItemFeedback = async (req, res) => {
  const { menuItemId } = req.params;
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(menuItemId) },
      select: { avg_rating: true, review_count: true }
    });

    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    const reviews = await prisma.feedback.findMany({
      where: { menu_item_id: parseInt(menuItemId) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { rating: true, comment: true, createdAt: true }
    });

    res.json({
      average_rating: menuItem.avg_rating,
      total_reviews: menuItem.review_count,
      reviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        menuItem: { select: { name: true } },
        order: { select: { table_id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
