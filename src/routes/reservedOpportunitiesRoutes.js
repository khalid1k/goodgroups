const express = require("express");
const router = express.Router();
const reservedOpportunityController = require("../controller/reservedOpportunitiesController");

router.post(
  "/Create-reserved-opportunity",
  reservedOpportunityController.createReservedOpportunity
);
router.delete(
  "/cancel-reserved-Opportunity/:id",
  reservedOpportunityController.deleteReservedOpportunity
);

module.exports = router;
