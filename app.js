require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Umzug, SequelizeStorage } = require("umzug");
const { Sequelize } = require("sequelize");
const db = require("./models");

// Routes
const authRoutes = require("./routes/auth");
const entrepriseRoutes = require("./routes/entreprise");
const userRoutes = require("./routes/user");
const siteRoutes = require("./routes/site");
const warehouseRoutes = require("./routes/warehouse");
const departmentRoutes = require("./routes/department");
const sectionRoutes = require("./routes/section");
const equipmentRoutes = require("./routes/equipment");
const equipmentMobileRoutes = require("./routes/equipmentMobile"); // ADD THIS LINE
const deskRoutes = require("./routes/desk");
const inventaireRoutes = require("./routes/inventaire");
const inventaireMobileRoutes = require("./routes/inventaireMobile");
const employeeRoutes = require("./routes/employee");

const app = express();

//
// 🔹 CORS Setup
//
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

//
// 🔹 Middleware
//
app.use(express.json());

//
// 🔹 Safe Migration Runner
//
async function runMigrationsSafely() {
  const umzug = new Umzug({
    migrations: {
      glob: "migrations/*.js",
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: () => migration.up(context, Sequelize),
          down: () => migration.down(context, Sequelize),
        };
      },
    },
    context: db.sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db.sequelize }),
    logger: console,
  });

  try {
    console.log("🗄️ Running migrations...");
    const pending = await umzug.pending();
    console.log(`📋 ${pending.length} migrations pending`);
    
    if (pending.length > 0) {
      await umzug.up();
      console.log("✅ All migrations completed successfully!");
    } else {
      console.log("✅ No pending migrations.");
    }
  } catch (err) {
    console.error("⚠️ Migration error:", err.message || err);
    console.log("⚠️ Continuing startup despite migration error...");
  }
}

//
// 🔹 Model Synchronization
//
async function syncModels() {
  try {
    console.log("🔄 Synchronizing models...");
    
    // Sync all models - use { force: true } only in development if you want to drop and recreate tables
    await db.sequelize.sync({ alter: true }); // This will alter tables to match models
    
    console.log("✅ All models synchronized successfully!");
    
    // Test that Inventaire model is available
    if (db.Inventaire) {
      console.log("✅ Inventaire model is properly registered");
    } else {
      console.log("❌ Inventaire model is NOT registered");
    }
  } catch (err) {
    console.error("❌ Model synchronization error:", err);
    throw err;
  }
}

//
// 🔹 Main Startup
//
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Run migrations safely
    await runMigrationsSafely();

    // Sync models (this will create missing tables)
    await syncModels();

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/entreprises", entrepriseRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/sites", siteRoutes);
    app.use("/api/warehouses", warehouseRoutes);
    app.use("/api/departments", departmentRoutes);
    app.use("/api/sections", sectionRoutes);
    app.use("/api/desks", deskRoutes);
    app.use("/api/equipment", equipmentRoutes);
    app.use("/api/mobile/equipment", equipmentMobileRoutes); // ADD THIS LINE
    app.use("/api/inventaires", inventaireRoutes);
    app.use("/api/mobile/inventaires", inventaireMobileRoutes);
    app.use("/api/employees", employeeRoutes);

    // Health check endpoint
    app.get("/", (req, res) => {
      res.json({ 
        message: "API is running!",
        models: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize')
      });
    });

    // Test Inventaire model endpoint
    app.get("/api/test-inventaire", async (req, res) => {
      try {
        const inventaireCount = await db.Inventaire.count();
        res.json({ 
          message: "Inventaire model is working!",
          count: inventaireCount
        });
      } catch (err) {
        res.status(500).json({ 
          error: "Inventaire model error",
          message: err.message 
        });
      }
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
  }
}

startServer();

//
// 🔹 Error Handling
//
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});