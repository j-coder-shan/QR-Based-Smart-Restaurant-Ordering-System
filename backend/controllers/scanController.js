const prisma = require('../prismaClient');

exports.handleScan = async (req, res) => {
  const { tableNumber, qrToken } = req.body;

  try {
    const table = await prisma.table.findUnique({
      where: { qr_token: qrToken },
      include: { restaurant: true }
    });

    if (!table || table.table_number !== tableNumber) {
      return res.status(401).json({ error: 'Invalid QR code or table identifier' });
    }

    // Check if restaurant is blocked
    if (table.restaurant.status === 'BLOCKED') {
        return res.status(403).json({ error: 'This restaurant service is temporarily unavailable.' });
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
          restaurant_id: table.restaurant_id,
          table_id: table.id,
          is_active: true
        }
      });
    }

    res.json({ 
      session_id: session.session_id, 
      table_number: table.table_number,
      restaurant_id: table.restaurant_id,
      restaurant_name: table.restaurant.name
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
