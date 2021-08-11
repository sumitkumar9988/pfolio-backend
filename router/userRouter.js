const express = require("express");
const authController = require("./../handler/authHandler");
const userController = require("./../handler/userHandler");
const projectController = require("./../handler/projectHandler");
const router = express.Router();

router
  .route("/")
  .get(authController.protect, userController.getProfile)
  .post(authController.protect, userController.createProfile)
  .patch(authController.protect, userController.updateProfile)
  .delete(authController.protect, userController.deleteProfile);

router
  .route("/education")
  .get(authController.protect, userController.getAllEducation)
  .post(authController.protect, userController.addEducation);

router
  .route("/education/:id")
  .get(authController.protect, userController.getEducationDetail)
  .patch(authController.protect, userController.updateEducation)
  .delete(authController.protect, userController.deleteEducation);

router
  .route("/experience")
  .get(authController.protect, userController.allUserExeprience)
  .post(authController.protect, userController.addExperience);

router
  .route("/experience/:id")
  .get(authController.protect, userController.getExperienceById)
  .patch(authController.protect, userController.updateExperience)
  .delete(authController.protect, userController.deleteExperienceDetail);

router
  .route("/githubauth")
  .get(authController.protect, projectController.guthubOAoth);

router
  .route("/github/callback")
  .post(authController.protect, projectController.githubCallBack);

router
  .route("/project")
  .get(authController.protect, projectController.getAllUserProject);

router
  .route("/project/:id")
  .get(authController.protect, projectController.getProjectDetails)
  .patch(authController.protect, projectController.updateProjectDetails);

router
  .route("/project/refesh")
  .get(authController.protect, projectController.refreshNewProject);

router
  .route("/addskills")
  .get(authController.protect, userController.addSkills);

module.exports = router;
