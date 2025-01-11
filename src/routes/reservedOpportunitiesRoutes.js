const express = require("express");
const router = express.Router();
const reservedOpportunityController = require("../controller/reservedOpportunitiesController");
const authController = require("../controller/authController");
router.post(
  "/Create-reserved-opportunity",
  authController.protectRoute,
  reservedOpportunityController.createReservedOpportunity
);
router.delete(
  "/cancel-reserved-Opportunity/:id",
  authController.protectRoute,
  reservedOpportunityController.deleteReservedOpportunity
);

module.exports = router;
