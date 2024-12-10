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
router.get(
  "/get-opportunities-by-distance",
  opportunityListController.getOpportunitiesByDistance
);
router.get(
  "/get-opportunities-by-segments",
  opportunityListController.getOpportunitiesBySegments
);
router.get(
  "/get-opportunities-by-time",
  opportunityListController.getOpportunitiesByTime
);
router.get(
  "/get-opportunities-by-Filters",
  opportunityListController.getFilteredOpportunities
);
module.exports = router;
