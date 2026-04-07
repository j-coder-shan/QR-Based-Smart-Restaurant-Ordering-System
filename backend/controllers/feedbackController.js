const prisma = require('../prismaClient');

exports.submitFeedback = async (req, res) => {
  const { order_id, menu_item_id, rating, comment } = req.body;
  try {
    const feedback = await prisma.feedback.create({
      data: {
        order_id: parseInt(order_id),
        menu_item_id: menu_item_id ? parseInt(menu_item_id) : null,
        rating: parseInt(rating),
        comment
      }
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
