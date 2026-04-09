const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.verifyLicense = async (req, res) => {
  const { licenseKey } = req.body;
  try {
    const key = await prisma.licenseKey.findUnique({ where: { key_code: licenseKey } });
    if (!key) {
      return res.status(404).json({ error: 'License key not found. Please contact support.' });
    }
    if (key.is_used) {
      return res.status(400).json({ error: 'This license key has already been used by another establishment.' });
    }
    res.json({ valid: true, message: 'License key verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- 1. Orange Header Block ---
    doc.rect(0, 0, 612, 120).fill('#ff5722');
    
    // Branding Text
    doc.fillColor('white').fontSize(32).font('Helvetica-Bold').text('SmartDine', 50, 45);
    doc.fontSize(10).font('Helvetica-Bold').text('SAAS CONNECTS SOLUTIONS', 50, 85, { characterSpacing: 2 });
    doc.fontSize(14).font('Helvetica').text('REGISTRATION RECEIPT', 400, 55, { align: 'right' });
    
    doc.moveDown(4);

    // --- 2. Business Information Card ---
    doc.fillColor('#334155').fontSize(16).font('Helvetica-Bold').text('Restaurant Details', 50, 150);
    doc.rect(50, 175, 512, 80).fill('#f8fafc');
    
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Establishment Name', 70, 190);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(restaurantName, 70, 205);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Category', 300, 190);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(category, 300, 205);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Date Authorized', 70, 230);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(new Date().toLocaleDateString(), 70, 245);

    doc.moveDown(7);

    // --- 3. Management Credentials Grid ---
    doc.fillColor('#334155').fontSize(16).font('Helvetica-Bold').text('Portal Access Credentials', 50, 280);
    
    // Admin Block
    doc.rect(50, 305, 240, 100).fill('#eff6ff').stroke('#bfdbfe');
    doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('ADMIN PORTAL', 70, 320);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Control Panel Access', 70, 335);
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text(`User: ${adminUsername}`, 70, 360);
    doc.text(`Key: ${adminPassword}`, 70, 380);

    // Staff Block
    doc.rect(310, 305, 240, 100).fill('#f5f3ff').stroke('#ddd6fe');
    doc.fillColor('#5b21b6').fontSize(10).font('Helvetica-Bold').text('STAFF / KITCHEN', 330, 320);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Daily Operations Access', 330, 335);
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text(`User: ${staffUsername}`, 330, 360);
    doc.text(`Key: ${staffPassword}`, 330, 380);

    doc.moveDown(10);

    // --- 4. Security & Support ---
    doc.rect(50, 440, 512, 60).fill('#fff7ed').stroke('#ffedd5');
    doc.fillColor('#9a3412').fontSize(9).font('Helvetica-Bold').text('SECURITY NOTICE', 70, 455);
    doc.fillColor('#c2410c').fontSize(9).font('Helvetica').text('Unauthorized access to these portals is strictly monitored. Please safeguard these credentials and update your passwords upon initial login.', 70, 470, { width: 470 });

    // Footer
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('Automating the future of fine dining.', 50, 720, { align: 'center' });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('Technical Support: +94 712 823 447 | Email: shanprabodh@icloud.com', 50, 735, { align: 'center' });

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
