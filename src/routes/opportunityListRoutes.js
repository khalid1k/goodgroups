const express = require("express");
const router = express.Router();
const opportunityListController = require("../controller/opportunityList");

router.get(
  "/get-all-opportunities-list",
  opportunityListController.getAllOpportunities
);
router.patch(
  "/update-favorite-status/:id",
  opportunityListController.updateFavoriteStatus
);
router.get(
  "/get-all-favorite-opportunities-list",
  opportunityListController.getFavoriteOpportunities
);
module.exports = router;
