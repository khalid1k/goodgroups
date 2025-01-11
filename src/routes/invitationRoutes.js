const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const invitationController = require("../controller/invitationController");
router.post(
  "/create-invitation",
  authController.protectRoute,
  invitationController.createInvitation
);

module.exports = router;
