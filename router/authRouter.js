const express = require("express");
const authController = require("./../handler/authHandler");
const router = express.Router();

router.get("/",authController.protect, authController.getUserData)

router.post("/signup", authController.signUp);
router.post("/signupGoogleOauth", authController.googleOAuthSignup);

router.post("/login", authController.login);
router.post("/goAuthLogin", authController.googleOauthLogin);

router.post("/forgetpassword", authController.forgotPassword); 
router.post("/resetpassword/:token", authController.resetPassword);
router.post("/changepassword",authController.protect,authController.updatePassword);


module.exports = router;
