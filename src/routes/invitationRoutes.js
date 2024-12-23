const express = require("express");
const router = express.Router();
const invitationController = require("../controller/invitationController");
router.post("/create-invitation", invitationController.createInvitation);

module.exports = router;
