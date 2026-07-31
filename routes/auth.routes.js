const { Router } = require("express");
const authController = require("../controllers/auth.controller.js");
const auth = require("../middleware/auth.js");
const authenticateRefreshToken = require("../middleware/authenticateRefreshToken.js");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authenticateRefreshToken, authController.refreshAccessToken);
router.get("/me", auth, authController.getMe);

module.exports = router;
