const prisma = require('../prismaClient');

exports.getTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany();
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
