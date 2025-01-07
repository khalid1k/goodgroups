const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { upload } = require("../utils/cloudinary");
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/signupGroup", authController.signUpGroup);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/getRecords", authController.getRecords);
router.delete("/delete-user/:email", authController.deleteUser);
router.get("/get-user-with-groups/:userId", authController.getUserWithGroups);
router.put("/update-user/:id", upload, authController.updateIndividualUser);
// Render reset password page
// router.get("/reset-Password/:token", async (req, res, next) => {
//   const token = req.params.token;
//   const accountType = req.query.accountType;
//   try {
//     // Ensure the token exists
//     if (!token) {
//       return res.status(400).send("Token is required.");
//     }

//     // Render the page with token
//     res.status(200).render("reset-password", { token, accountType });
//   } catch (err) {
//     next(err);
//   }
// });
module.exports = router;
