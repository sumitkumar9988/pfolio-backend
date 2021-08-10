const express = require("express");
const authController = require("./../handler/authHandler");
const userController = require("./../handler/userHandler");
const projectController = require("./../handler/projectHandler");
const router = express.Router();

//  all route related to profile

router
  .route("/")
  .get(authController.protect, userController.getProfile)
  .post(authController.protect, userController.createProfile)
  .patch(authController.protect, userController.updateProfile)
  .delete(authController.protect, userController.deleteUser);

router.patch(
  "/social",
  authController.protect,
  userController.updateSocialNetworking
);

router.get(
  "/education",
  authController.protect,
  userController.getAllEducation
);
router.post("/education", authController.protect, userController.addEducation);
router.delete(
  "/education/:id",
  authController.protect,
  userController.deleteEducationDetail
);
router.get(
  "/education/:id",
  authController.protect,
  userController.getEducationDetail
);
router.patch(
  "/education/:id",
  authController.protect,
  userController.updateEducation
);

router.get(
  "/experience",
  authController.protect,
  userController.allUserExeprience
);
router.post(
  "/experience",
  authController.protect,

  userController.addExperience
);
router.get(
  "/experience/:id",
  authController.protect,
  userController.getExperienceById
);
router.delete(
  "/experience/:id",
  authController.protect,
  userController.deleteExperienceDetail
);
router.patch(
  "/experience/:id",
  authController.protect,
  userController.updateExperience
);

router.get(
  "/githubauth",
  authController.protect,
  projectController.guthubOAoth
);
router.post(
  "/github/callback",
  authController.protect,
  projectController.githubCallBack
);

router.get(
  "/project",
  authController.protect,
  projectController.getAllUserProject
);

router.get(
  "/project/refesh",
  authController.protect,
  projectController.refreshNewProject
);

router.get(
  "/project/:id",
  authController.protect,
  projectController.getProjectDetails
);
router.patch(
  "/project/:id",
  authController.protect,

  projectController.updateProjectDetails
);


router.post("/addskills", authController.protect, userController.addSkills);


module.exports = router;
