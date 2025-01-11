const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");
router.post(
  "/create-review",
  authController.protectRoute,
  reviewController.createReview
);
router.post(
  "/delete-review",
  authController.protectRoute,
  reviewController.deleteReview
);
module.exports = router;
