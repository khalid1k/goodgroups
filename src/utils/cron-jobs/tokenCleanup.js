const cron = require("cron");
const { Op } = require("sequelize");
const BlacklistedToken = require("../../models/blacklistedToken");
// Set up a cron job to run every day at midnight
const job = new cron.CronJob("0 0 * * *", async () => {
  try {
    const currentDate = new Date();
    // Clean expired tokens
    await BlacklistedToken.destroy({
      where: {
        expiryDate: {
          [Op.lt]: currentDate,
        },
      },
    });
    console.log("Expired tokens cleaned up successfully.");
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
});

// Start the cron job
job.start();
