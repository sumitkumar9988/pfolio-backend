const express = require("express");
const authController = require("./../handler/authHandler");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/signupGoogleOauth", authController.googleOAuthSignup);

router.post("/login", authController.login);
router.post("/goAuthLogin", authController.googleOauthLogin);

router.post("/forgetpassword", authController.forgotPassword); // testing done
router.post("/resetpassword/:token", authController.resetPassword);
router.post(
  "/changepassword",
  authController.protect,
  authController.updatePassword
);

router
  .route("/")
  .get(authController.protect, authController.getUserData)


module.exports = router;
