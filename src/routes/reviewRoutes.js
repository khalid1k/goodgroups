const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");

router.post("/create-review", reviewController.createReview);
router.post("/delete-review", reviewController.deleteReview);
module.exports = router;
