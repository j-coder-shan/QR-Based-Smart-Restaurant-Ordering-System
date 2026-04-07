const prisma = require('../prismaClient');

exports.handleScan = async (req, res) => {
  const { tableNumber, qrToken } = req.body;

  try {
    const table = await prisma.table.findUnique({
      where: { table_number: tableNumber }
    });

    if (!table || table.qr_token !== qrToken) {
      return res.status(401).json({ error: 'Invalid QR code' });
    }

    // Check if there is an active session for this table
    let session = await prisma.session.findFirst({
      where: { 
        table_id: table.id, 
        is_active: true 
      }
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          table_id: table.id,
          is_active: true
        }
      });
    }

    res.json({ 
      session_id: session.session_id, 
      table_number: table.table_number 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
