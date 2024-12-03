const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
// PostgreSQL connection configuration
const sequelize = new Sequelize("goodgroups", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
});

const mongoURI = process.env.MONGO_DB_URL;
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
  }
}

module.exports = { sequelize, connectDB, Sequelize };
