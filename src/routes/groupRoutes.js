const express = require("express");
const router = express.Router();
const groupController = require("../controller/groupController");

router.post("/add-to-group", groupController.addUserToGroup);
router.get("/get-user/groups", groupController.getUserGroups);

module.exports = router;
