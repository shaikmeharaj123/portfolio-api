const { Router } = require("express");
const projectController = require("../controllers/project.controller.js");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");

const router = Router();

router
  .route("/")
  .get(projectController.getAllProjects)
  .post(auth, restrictTo("super_admin", "admin"), projectController.createProject);

router
  .route("/:id")
  .get(projectController.getProject)
  .patch(auth, restrictTo("super_admin", "admin"), projectController.updateProject)
  .delete(auth, restrictTo("super_admin", "admin"), projectController.deleteProject);

module.exports = router;
