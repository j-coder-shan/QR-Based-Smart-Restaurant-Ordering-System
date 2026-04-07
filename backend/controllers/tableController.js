const prisma = require('../prismaClient');
const crypto = require('crypto');

exports.getTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: 'asc' }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTableByNumber = async (req, res) => {
  const { tableNumber } = req.params;
  try {
    const table = await prisma.table.findUnique({
      where: { table_number: tableNumber }
    });
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTable = async (req, res) => {
  const { table_number, capacity } = req.body;
  const qr_token = crypto.randomBytes(16).toString('hex');
  try {
    const newTable = await prisma.table.create({
      data: {
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
  const new_qr_token = crypto.randomBytes(16).toString('hex');
  try {
    const updatedTable = await prisma.table.update({
      where: { id: parseInt(id) },
      data: { qr_token: new_qr_token }
    });
    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.table.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
