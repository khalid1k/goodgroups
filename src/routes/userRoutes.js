const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const { upload } = require("../utils/cloudinary");
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/signupGroup", authController.signUpGroup);
router.post("/logout", authController.protectRoute, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/getRecords", authController.getRecords);
router.delete("/delete-user/:email", authController.deleteUser);
router.get(
  "/get-user-with-groups/:userId",
  authController.protectRoute,
  authController.getUserWithGroups
);
router.put(
  "/update-user/:id",
  authController.protectRoute,
  upload,
  authController.updateIndividualUser
);
router.patch("/change-user-level", userController.changeUserLevel);
router.patch("/change-user-points", userController.changeUserPoints);
router.get(
  "/get-sorted-users-by-hours/:id",
  userController.getUsersAroundSpecifiedUser
);
router.get("/get-user-hours-dob/:id", userController.getUserHoursAndDob);
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
