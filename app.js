require("dotenv").config();
const express = require("express");
const cors = require("cors"); // ✅ add CORS
const { Umzug, SequelizeStorage } = require("umzug");
const { Sequelize } = require("sequelize"); // ✅ needed for migrations
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
const inventaireRoutes = require("./routes/inventaire"); // ✅ Added inventory routes
const inventaireMobileRoutes = require("./routes/inventaireMobile"); // ✅ Added mobile inventory routes
const employeeRoutes = require("./routes/employee"); // ✅ Added employee routes


const app = express();

//
// 🔹 CORS Setup
//
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // ✅ Added PATCH method
    credentials: true, // allow cookies / auth headers
  })
);

//
// 🔹 Middleware
//
app.use(express.json());

//
// 🔹 Migrations
//
async function runMigrations() {
  const umzug = new Umzug({
    migrations: {
      glob: "migrations/*.js",
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: () => migration.up(context, Sequelize), // ✅ inject Sequelize
          down: () => migration.down(context, Sequelize),
        };
      },
    },
    context: db.sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db.sequelize }),
    logger: console,
  });

  await umzug.up();
}

runMigrations()
  .then(() => console.log("✅ Migrations up to date!"))
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });

//
// 🔹 Routes
//
app.use("/api/auth", authRoutes);
app.use("/api/entreprises", entrepriseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/desks", deskRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/inventaires", inventaireRoutes); // ✅ Added inventory routes (admin)
app.use("/api/mobile/inventaires", inventaireMobileRoutes); // ✅ Added mobile inventory routes
app.use("/api/employees", employeeRoutes); // ✅ Added employee routes


app.get("/", (req, res) => {
  res.send("API is running!");
});

//
// 🔹 Start Server
//
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

console.log("App started and listening for requests...");

//
// 🔹 Error Handling
//
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});