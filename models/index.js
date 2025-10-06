'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 🔹 ADD DEBUG LOGGING HERE
console.log('🔄 Loading models from directory:', __dirname);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(`📁 Loading model: ${file}`); // ADD THIS LINE
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
      console.log(`✅ Successfully loaded model: ${model.name}`); // ADD THIS LINE
    } catch (error) {
      console.error(`❌ Failed to load model from ${file}:`, error.message); // ADD THIS LINE
    }
  });

// 🔹 CHECK IF INVENTAIRE IS LOADED
console.log('📋 Loaded models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

// 🔹 SETUP ASSOCIATIONS
console.log('🔄 Setting up associations...');
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`✅ Associated model: ${modelName}`);
    } catch (error) {
      console.error(`❌ Failed to associate model ${modelName}:`, error.message);
    }
  }
});

// 🔹 ADDITIONAL ASSOCIATIONS (only for models that don't have associate method)
// Add Employee associations
if (db.Employee && db.Entreprise) {
  db.Entreprise.hasMany(db.Employee, {
    foreignKey: 'id_entreprise',
    as: 'employees'
  });
  console.log('✅ Added Entreprise->Employee association');
}

// Add Equipment-Employee association
if (db.Equipment && db.Employee) {
  db.Employee.hasMany(db.Equipment, {
    foreignKey: 'employee_id',
    as: 'equipment'
  });
  console.log('✅ Added Employee->Equipment association');
}

// 🔹 VERIFY INVENTAIRE MODEL
if (db.Inventaire) {
  console.log('🎯 Inventaire model is loaded and ready!');
  // Verify associations are set up
  if (db.User && db.Inventaire.associations && db.Inventaire.associations.associatedUser) {
    console.log('✅ Inventaire-User association is set');
  }
  if (db.Desk && db.Inventaire.associations && db.Inventaire.associations.desk) {
    console.log('✅ Inventaire-Desk association is set');
  }
  if (db.Section && db.Inventaire.associations && db.Inventaire.associations.section) {
    console.log('✅ Inventaire-Section association is set');
  }
} else {
  console.log('❌ Inventaire model is NOT loaded!');
  // Check if the file exists
  const inventaireFile = path.join(__dirname, 'inventaire.js');
  if (fs.existsSync(inventaireFile)) {
    console.log('📄 Inventaire file exists but failed to load');
  } else {
    console.log('📄 Inventaire file does not exist');
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('✅ Database initialization complete');
module.exports = db;