const { Router } = require("express");
const contactController = require("../controllers/contact.controller.js");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");

const router = Router();

router.post("/", contactController.createContactMessage);

router
  .route("/")
  .get(auth, restrictTo("super_admin", "admin"), contactController.getAllContactMessages);

router
  .route("/:id")
  .get(auth, restrictTo("super_admin", "admin"), contactController.getContactMessage)
  .patch(auth, restrictTo("super_admin", "admin"), contactController.updateContactMessage)
  .delete(auth, restrictTo("super_admin", "admin"), contactController.deleteContactMessage);

module.exports = router;
