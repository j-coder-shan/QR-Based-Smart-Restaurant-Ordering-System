const prisma = require('../prismaClient');

exports.getMenu = async (req, res) => {
  const { restaurantId } = req;
  try {
    const menu = await prisma.menuItem.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { category: 'asc' }
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  const { restaurantId } = req;
  try {
    const categories = await prisma.category.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { name: 'asc' }
    });
    res.json(categories.map(c => c.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const { restaurantId } = req;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  
  try {
    const category = await prisma.category.upsert({
      where: { 
          restaurant_id_name: { 
              restaurant_id: restaurantId,
              name: name 
          } 
      },
      update: {},
      create: { 
          restaurant_id: restaurantId,
          name: name 
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuItem = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  try {
    const menuItem = await prisma.menuItem.findFirst({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId 
      }
    });
    if (!menuItem) return res.status(404).json({ error: 'Item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  const { name, description, price, category, stock, low_stock_threshold, is_available, prep_time } = req.body;
  const { restaurantId } = req;
  const image_url = req.file ? `/public/images/${req.file.filename}` : req.body.image_url;

  try {
    // Ensure category exists in Category table if provided
    if (category) {
      await prisma.category.upsert({
        where: { 
            restaurant_id_name: { 
                restaurant_id: restaurantId,
                name: category 
            } 
        },
        update: {},
        create: { 
            restaurant_id: restaurantId,
            name: category 
        }
      });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        restaurant_id: restaurantId,
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
  const { restaurantId } = req;
  const { name, description, price, category, stock, low_stock_threshold, is_available, prep_time } = req.body;
  const image_url = req.file ? `/public/images/${req.file.filename}` : req.body.image_url;

  try {
    // Ensure category exists in Category table if provided
    if (category) {
      await prisma.category.upsert({
        where: { 
            restaurant_id_name: { 
                restaurant_id: restaurantId,
                name: category 
            } 
        },
        update: {},
        create: { 
            restaurant_id: restaurantId,
            name: category 
        }
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId
      },
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
  const { restaurantId } = req;
  try {
    await prisma.menuItem.delete({ 
        where: { 
            id: parseInt(id),
            restaurant_id: restaurantId
        } 
    });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { category } = req.params;
  const { restaurantId } = req;
  try {
    // Delete items in category for this restaurant
    const result = await prisma.menuItem.deleteMany({
      where: { 
          category: category,
          restaurant_id: restaurantId 
      }
    });
    // Delete category from Category table
    await prisma.category.delete({
      where: { 
          restaurant_id_name: { 
              restaurant_id: restaurantId,
              name: category 
          }
      }
    });
    res.json({ message: `Deleted ${result.count} items and category: ${category}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
