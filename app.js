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
    await umzug.up();
    console.log("✅ All migrations completed successfully!");
  } catch (err) {
    console.error("⚠️ Migration error:", err.message || err);
    console.log("⚠️ Continuing startup despite migration error...");
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
    app.use("/api/inventaires", inventaireRoutes);
    app.use("/api/mobile/inventaires", inventaireMobileRoutes);
    app.use("/api/employees", employeeRoutes);

    app.get("/", (req, res) => {
      res.send("API is running!");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Fatal startup error:", err);
  }
}

startServer();

//
// 🔹 Error Handling
//
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
