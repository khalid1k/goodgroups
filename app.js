require("dotenv").config();
const express = require("express");
const appError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controller/errorController");
const rateLimit = require("express-rate-limit");
const { connectDB, sequelize } = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const otpRoute = require("./src/routes/otpVerifyRoute");
const opportunitiesRoute = require("./src/routes/opportunityListRoutes");
const socialAuthRoutes = require("./src/routes/socialAuthRoutes");
const volunteerRoutes = require("./src/routes/volunteerRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const reservedOpportunityRoutes = require("./src/routes/reservedOpportunitiesRoutes");
const invitationRoutes = require("./src/routes/invitationRoutes");
const groupRoutes = require("./src/routes/groupRoutes");
const xss = require("xss-clean");
const helmet = require("helmet");
const app = express();
require("./src/utils/cron-jobs/tokenCleanup");
const path = require("path");
const PORT = 3000;
app.use(helmet());
// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(xss());
app.set("trust proxy", 1);
//security for limit requests
const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "to many request from this IP please try again in an hour",
});
app.use(limiter);
app.use(express.static("src/public"));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views")); // Folder for Pug files
app.use(express.urlencoded({ extended: true }));
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(socialAuthRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/otp", otpRoute);
app.use("/api/v1/opportunities", opportunitiesRoute);
app.use("/api/v1/volunteer", volunteerRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/reserved-opportunities", reservedOpportunityRoutes);
app.use("/api/v1/invitation", invitationRoutes);
app.use("/api/v1/groups", groupRoutes);
//handle the wrong routes
app.all("*", (req, res, next) => {
  next(new appError(`Can't Find ${req.originalUrl} on this server`, 404));
});
//handle the error
app.use(globalErrorHandler);
// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDB();

  // Sync models with the database
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log("Database synced!");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
});
