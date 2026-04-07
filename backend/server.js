const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const tableRoutes = require('./routes/tableRoutes');
const menuRoutes = require('./routes/menuRoutes');
const scanRoutes = require('./routes/scanRoutes');
const orderRoutes = require('./routes/orderRoutes');
const waiterCallRoutes = require('./routes/waiterCallRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/waiter-call', waiterCallRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Intelligent Restaurant Ordering System API running - Phase 10 Payment System" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong! " + err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
