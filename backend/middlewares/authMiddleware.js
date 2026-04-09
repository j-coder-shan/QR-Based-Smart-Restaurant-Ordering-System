const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    req.username = decoded.username;
    req.role = decoded.role;
    req.restaurantId = decoded.restaurantId;
    next();
  });
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Require Super Admin Role!' });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.role !== 'ADMIN' && req.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Require Admin Role!' });
  }
  next();
};

exports.isStaff = (req, res, next) => {
  if (req.role !== 'STAFF' && req.role !== 'ADMIN' && req.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Require Staff Role!' });
  }
  next();
};
