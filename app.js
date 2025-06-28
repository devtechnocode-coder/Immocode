require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const entrepriseRoutes = require('./routes/entreprise');
const userRoutes = require('./routes/user');
const siteRoutes = require('./routes/site');
const warehouseRoutes = require('./routes/warehouse');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/warehouses', warehouseRoutes);

app.get('/', (req, res) => {
  res.send('API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log('App started and listening for requests...');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
}); 