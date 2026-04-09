const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Super Admin Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.superAdmin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'SUPER_ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: 'SUPER_ADMIN', username: admin.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Key Management
exports.generateKeys = async (req, res) => {
  const { count = 1 } = req.body;
  const keys = [];

  try {
    for (let i = 0; i < count; i++) {
        const key_code = `RESTO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const key = await prisma.licenseKey.create({
            data: { key_code }
        });
        keys.push(key);
    }
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllKeys = async (req, res) => {
  try {
    const keys = await prisma.licenseKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurant Management
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        subscription: true,
        _count: {
          select: { orders: true, menuItems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRestaurantDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        subscription: true,
        payments: true,
        users: { select: { username: true, role: true } },
        _count: {
            select: { orders: true, menuItems: true }
        }
      }
    });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // ACTIVE or BLOCKED

  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.extendTrial = async (req, res) => {
    const { id } = req.params;
    const { days } = req.body;
  
    try {
      const sub = await prisma.subscription.findUnique({
        where: { restaurant_id: parseInt(id) }
      });

      if (!sub) return res.status(404).json({ error: 'Subscription not found' });

      const newDate = new Date(sub.trial_end_date);
      newDate.setDate(newDate.getDate() + parseInt(days));

      const updated = await prisma.subscription.update({
        where: { restaurant_id: parseInt(id) },
        data: { trial_end_date: newDate, status: 'TRIAL' } // Ensure it's back in trial if it was expired
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

// System Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const total = await prisma.restaurant.count();
    const active = await prisma.restaurant.count({ where: { subscription: { status: 'ACTIVE' } } });
    const trial = await prisma.restaurant.count({ where: { subscription: { status: 'TRIAL' } } });
    const expired = await prisma.restaurant.count({ where: { subscription: { status: 'EXPIRED' } } });
    
    const totalPayments = await prisma.subscriptionPayment.aggregate({
        _sum: { amount: true }
    });

    res.json({
      total_restaurants: total,
      active,
      trial,
      expired,
      total_revenue: totalPayments._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
