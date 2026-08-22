const { Router } = require("express");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const {
  createOCRInterviewQuestion,
  getOCRInterviewQuestions,
  getOCRInterviewQuestion,
  updateOCRInterviewQuestion,
  deleteOCRInterviewQuestion,
  duplicateOCRInterviewQuestion,
} = require("../controllers/ocrInterviewQuestion.controller.js");

const router = Router();
const adminOnly = [auth, restrictTo("super_admin", "admin")];

router.route("/").get(...adminOnly, getOCRInterviewQuestions).post(...adminOnly, createOCRInterviewQuestion);
router.route("/:id").get(...adminOnly, getOCRInterviewQuestion).patch(...adminOnly, updateOCRInterviewQuestion).put(...adminOnly, updateOCRInterviewQuestion).delete(...adminOnly, deleteOCRInterviewQuestion);
router.post("/:id/duplicate", ...adminOnly, duplicateOCRInterviewQuestion);

module.exports = router;
