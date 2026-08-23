const { Router } = require("express");
const uploadController = require("../controllers/upload.controller.js");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const { upload } = require("../middleware/upload.js");

const router = Router();

router.use(auth, restrictTo("super_admin", "admin"));

router.post("/single", upload.single("file"), uploadController.uploadSingle);
router.post("/multiple", upload.array("files", 10), uploadController.uploadMultiple);

module.exports = router;
