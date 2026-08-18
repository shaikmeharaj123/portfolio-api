const { Router } = require("express");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const notificationController = require("../controllers/notification.controller.js");

const router = Router();

router.use(auth, restrictTo("super_admin", "admin"));

router.get("/", notificationController.getNotifications);
router.patch("/mark-all-read", notificationController.markAllNotificationsRead);
router.patch("/:id/read", notificationController.markNotificationRead);

module.exports = router;
