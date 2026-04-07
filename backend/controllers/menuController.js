const prisma = require('../prismaClient');

exports.getMenu = async (req, res) => {
  try {
    const menu = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories.map(c => c.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  
  try {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    res.status(201).json(category);
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

exports.createMenuItem = async (req, res) => {
  const { name, description, price, category, stock, low_stock_threshold, is_available, prep_time } = req.body;
  const image_url = req.file ? `/public/images/${req.file.filename}` : req.body.image_url;

  try {
    // Ensure category exists in Category table if provided
    if (category) {
      await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category }
      });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        image_url,
        stock: parseInt(stock) || 0,
        low_stock_threshold: parseInt(low_stock_threshold) || 5,
        is_available: is_available === 'true' || is_available === true,
        prep_time: parseInt(prep_time) || 15
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, low_stock_threshold, is_available, prep_time } = req.body;
  const image_url = req.file ? `/public/images/${req.file.filename}` : req.body.image_url;

  try {
    // Ensure category exists in Category table if provided
    if (category) {
      await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category }
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        image_url,
        stock: stock ? parseInt(stock) : undefined,
        low_stock_threshold: low_stock_threshold ? parseInt(low_stock_threshold) : undefined,
        is_available: is_available !== undefined ? (is_available === 'true' || is_available === true) : undefined,
        prep_time: prep_time ? parseInt(prep_time) : undefined
      }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { category } = req.params;
  try {
    // Delete items in category
    const result = await prisma.menuItem.deleteMany({
      where: { category: category }
    });
    // Delete category from Category table
    await prisma.category.delete({
      where: { name: category }
    });
    res.json({ message: `Deleted ${result.count} items and category: ${category}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
