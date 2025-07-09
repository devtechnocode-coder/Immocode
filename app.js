require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const entrepriseRoutes = require('./routes/entreprise');
const userRoutes = require('./routes/user');
const siteRoutes = require('./routes/site');
const warehouseRoutes = require('./routes/warehouse');
const departmentRoutes = require('./routes/department');
const sectionRoutes = require('./routes/section');
const { Umzug, SequelizeStorage } = require('umzug');
const db = require('./models');

async function runMigrations() {
  const umzug = new Umzug({
    migrations: { glob: 'migrations/*.js' },
    context: db.sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db.sequelize }),
    logger: console,
  });
  await umzug.up();
}

runMigrations()
  .then(() => {
    console.log('Migrations up to date!');
  })
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sections', sectionRoutes);

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