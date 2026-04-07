const prisma = require('../prismaClient');
const crypto = require('crypto');

exports.getTables = async (req, res) => {
  const { restaurantId } = req;
  try {
    const tables = await prisma.table.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: { table_number: 'asc' }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTableByNumber = async (req, res) => {
  const { tableNumber } = req.params;
  const { restaurantId } = req;
  try {
    const table = await prisma.table.findFirst({
      where: { 
          table_number: tableNumber,
          restaurant_id: restaurantId
      }
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTable = async (req, res) => {
  const { table_number, capacity } = req.body;
  const { restaurantId } = req;
  const qr_token = crypto.randomBytes(16).toString('hex');
  try {
    const newTable = await prisma.table.create({
      data: {
        restaurant_id: restaurantId,
        table_number,
        capacity: parseInt(capacity) || 2,
        qr_token
      }
    });
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.regenerateQR = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  const new_qr_token = crypto.randomBytes(16).toString('hex');
  try {
    const updatedTable = await prisma.table.update({
      where: { 
          id: parseInt(id),
          restaurant_id: restaurantId
      },
      data: { qr_token: new_qr_token }
    });
    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  const { restaurantId } = req;
  try {
    await prisma.table.delete({ 
        where: { 
            id: parseInt(id),
            restaurant_id: restaurantId
        } 
    });
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
