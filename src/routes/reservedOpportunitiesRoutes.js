const express = require("express");
const router = express.Router();
const reservedOpportunityController = require("../controller/reservedOpportunitiesController");

router.post(
  "/Create-reserved-opportunity",
  reservedOpportunityController.createReservedOpportunity
);

module.exports = router;
