const express = require("express");
const router = express.Router();
const opportunityListController = require("../controller/opportunityList");

router.get(
  "/get-all-opportunities-list",
  opportunityListController.getAllOpportunities
);
module.exports = router;
