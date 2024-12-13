const express = require("express");
const router = express.Router();
const volunteerController = require("../controller/volunteerController");

router.post("/create-volunteer", volunteerController.createVolunteer);
router.delete("/delete-volunteer/:id", volunteerController.deleteVolunteer);
module.exports = router;
