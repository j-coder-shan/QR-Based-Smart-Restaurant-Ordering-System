const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.register = async (req, res) => {
  const { 
    licenseKey, 
    restaurantName, 
    category, 
    email, 
    phone, 
    adminUsername, 
    adminPassword, 
    staffUsername, 
    staffPassword 
  } = req.body;

  try {
    // 1. Validate License Key
    const key = await prisma.licenseKey.findUnique({ where: { key_code: licenseKey } });
    if (!key || key.is_used) {
      return res.status(400).json({ error: 'Invalid or already used license key' });
    }

    // 2. Uniqueness Checks
    const adminExists = await prisma.user.findUnique({ where: { username: adminUsername } });
    const staffExists = await prisma.user.findUnique({ where: { username: staffUsername } });

    if (adminExists || staffExists) {
      return res.status(400).json({ error: 'One or more usernames are already taken across the system.' });
    }

    // 3. Create Restaurant & Users in Transaction
    const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);
    const hashedPasswordStaff = await bcrypt.hash(staffPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          category,
          email,
          phone,
          subscription: {
            create: {
              status: 'TRIAL',
              trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        }
      });

      await tx.user.createMany({
        data: [
          { restaurant_id: restaurant.id, username: adminUsername, password_hash: hashedPasswordAdmin, role: 'ADMIN' },
          { restaurant_id: restaurant.id, username: staffUsername, password_hash: hashedPasswordStaff, role: 'STAFF' }
        ]
      });

      await tx.licenseKey.update({
        where: { id: key.id },
        data: { is_used: true, restaurant_name: restaurantName }
      });

      return restaurant;
    });

    // 4. Generate PDF Receipt
    const fileName = `Registration_${result.id}_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, '../uploads/receipts');
    const filePath = path.join(dirPath, fileName);
    
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(24).text('Smart Dine - Registration Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Hotel Name: ${restaurantName}`);
    doc.text(`Category: ${category}`);
    doc.text(`Registration Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(18).text('Management Credentials', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text('--- Admin Portal ---');
    doc.text(`Username: ${adminUsername}`);
    doc.text(`Password: ${adminPassword}`);
    doc.moveDown();
    
    doc.text('--- Staff / Kitchen Portal ---');
    doc.text(`Username: ${staffUsername}`);
    doc.text(`Password: ${staffPassword}`);
    doc.moveDown();
    
    doc.fontSize(10).fillColor('gray').text('Please keep this document secure. These credentials are required for your first login.');
    doc.end();

    // Respond when stream is finished to ensure file exists
    stream.on('finish', () => {
        res.json({ 
            message: 'Registration successful!', 
            restaurant: result,
            downloadUrl: `/uploads/receipts/${fileName}`
        });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware to check subscription and restaurant status
exports.checkAccess = async (req, res, next) => {
    const { restaurantId } = req;
    if (!restaurantId) return next(); // Not a tenant route or superadmin

    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { subscription: true }
        });

        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        // 1. Check if blocked by Super Admin
        if (restaurant.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Your account has been blocked by the system administrator.' });
        }

        // 2. Check Subscription
        const sub = restaurant.subscription;
        const now = new Date();

        if (sub.status === 'EXPIRED') {
            return res.status(403).json({ error: 'Subscription expired. Please renew to continue.' });
        }

        if (sub.status === 'TRIAL' && now > sub.trial_end_date) {
            // Auto-update to expired if trial time passed
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'EXPIRED' }
            });
            return res.status(403).json({ error: 'Free trial expired. Please purchase a subscription.' });
        }

        if (sub.status === 'ACTIVE' && now > sub.end_date) {
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'EXPIRED' }
            });
            return res.status(403).json({ error: 'Annual subscription expired. Please renew.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.activateSubscription = async (req, res) => {
    const { restaurantId } = req;
    const { payment_method } = req.body;

    try {
        const sub = await prisma.subscription.update({
            where: { restaurant_id: restaurantId },
            data: {
                status: 'ACTIVE',
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        });

        await prisma.subscriptionPayment.create({
            data: {
                restaurant_id: restaurantId,
                amount: 10000, // Fixed price for annual
                payment_method,
                type: 'ANNUAL'
            }
        });

        res.json({ message: 'Subscription activated successfully!', subscription: sub });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
