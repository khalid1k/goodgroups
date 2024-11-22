const { Sequelize } = require("sequelize");

// PostgreSQL connection configuration
const sequelize = new Sequelize("goodgroups", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = { sequelize, connectDB, Sequelize };
