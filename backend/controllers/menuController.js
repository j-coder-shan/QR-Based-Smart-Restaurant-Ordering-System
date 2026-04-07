const prisma = require('../prismaClient');

exports.getMenu = async (req, res) => {
  try {
    const menu = await prisma.menuItem.findMany({
      where: { is_available: true },
      orderBy: { category: 'asc' }
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });
    if (!menuItem) return res.status(404).json({ error: 'Item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
