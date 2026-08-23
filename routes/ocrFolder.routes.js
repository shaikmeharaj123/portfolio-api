const { Router } = require("express");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  addQuestionsToFolder,
  removeQuestionFromFolder,
  toggleFavorite,
  getFavorites,
} = require("../controllers/ocrFolder.controller.js");

const router = Router();
const adminOnly = [auth, restrictTo("super_admin", "admin")];

router.get("/favorites", ...adminOnly, getFavorites);
router.post("/favorites/toggle", ...adminOnly, toggleFavorite);
router.route("/").get(...adminOnly, getFolders).post(...adminOnly, createFolder);
router.route("/:id/questions").post(...adminOnly, addQuestionsToFolder);
router.delete("/:id/questions/:questionId", ...adminOnly, removeQuestionFromFolder);
router.route("/:id").get(...adminOnly, getFolder).patch(...adminOnly, updateFolder).delete(...adminOnly, deleteFolder);

module.exports = router;
