const Notification = require("../models/Notification.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");

exports.getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
  const unreadCount = await Notification.countDocuments({ isRead: false });
  const docs = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Notifications fetched successfully", {
      docs,
      unreadCount,
      total: docs.length,
    })
  );
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const doc = await Notification.findById(req.params.id);
  if (!doc) {
    throw new ApiError(404, "No notification found with that ID");
  }

  doc.isRead = true;
  doc.readAt = new Date();
  await doc.save();

  res.status(200).json(new ApiResponse(200, "Notification marked as read", doc));
});

exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  res.status(200).json(new ApiResponse(200, "All notifications marked as read", null));
});
