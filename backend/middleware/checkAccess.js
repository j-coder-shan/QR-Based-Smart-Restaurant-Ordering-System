const prisma = require('../prismaClient');

/**
 * Middleware to check if the restaurant has an active subscription or trial
 * Requires req.restaurantId to be set (usually by verifyToken middleware)
 */
const checkAccess = async (req, res, next) => {
    const { restaurantId } = req;

    if (!restaurantId) {
        return res.status(401).json({ error: 'Restaurant context missing. Authentication required.' });
    }

    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                subscription: true
            }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found.' });
        }

        if (restaurant.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Restaurant is blocked. Please contact support.' });
        }

        const sub = restaurant.subscription;
        if (!sub) {
            return res.status(403).json({ error: 'No subscription found for this restaurant.' });
        }

        // 1. Check for Active Subscription
        if (sub.status === 'ACTIVE' && sub.end_date && new Date(sub.end_date) > new Date()) {
            return next(); // Has active subscription
        }

        // 2. Check for Free Trial
        if (sub.status === 'TRIAL' && sub.trial_end_date && new Date(sub.trial_end_date) > new Date()) {
            return next(); // Still in free trial
        }

        // 3. No active subscription and trial expired
        return res.status(403).json({ 
            error: 'Subscription expired', 
            trial_expired: sub.status === 'TRIAL',
            message: 'Your free trial or subscription has expired. Please renew to continue using the system.'
        });

    } catch (error) {
        res.status(500).json({ error: 'Access check failed: ' + error.message });
    }
};

module.exports = { checkAccess };
