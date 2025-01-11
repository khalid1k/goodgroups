const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudinary");
const opportunityListController = require("../controller/opportunityList");
const authController = require("../controller/authController");
router.post(
  "/create-opportunity-list",
  authController.protectRoute,
  upload,
  opportunityListController.createOpportunityList
);
router.put(
  "/update-opportunity-list/:id",
  authController.protectRoute,
  upload,
  opportunityListController.updateOpportunityList
);
router.delete(
  "/delete-opportunity-list/:id",
  authController.protectRoute,
  opportunityListController.deleteOpportunityList
);
router.get(
  "/get-all-opportunities-list",
  authController.protectRoute,
  opportunityListController.getAllOpportunities
);
router.patch(
  "/update-favorite-status/:id",
  authController.protectRoute,
  opportunityListController.updateFavoriteStatus
);
router.get(
  "/get-all-favorite-opportunities-list",
  authController.protectRoute,
  opportunityListController.getFavoriteOpportunities
);
router.get(
  "/get-opportunities-by-distance",
  authController.protectRoute,
  opportunityListController.getOpportunitiesByDistance
);
router.get(
  "/get-opportunities-by-segments",
  authController.protectRoute,
  opportunityListController.getOpportunitiesBySegments
);
router.get(
  "/get-opportunities-by-time",
  authController.protectRoute,
  opportunityListController.getOpportunitiesByTime
);
router.get(
  "/get-opportunities-by-Filters",
  authController.protectRoute,
  opportunityListController.getFilteredOpportunities
);
router.get(
  "/getOpportunitiesByUser",
  authController.protectRoute,
  opportunityListController.getOpportunitiesByUserAndAccountType
);
router.patch(
  "/change-opportunity-listing-status",
  authController.protectRoute,
  opportunityListController.changeOpportunityListingStatus
);
module.exports = router;
