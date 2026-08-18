const Contact = require("../models/Contact.js");
const Notification = require("../models/Notification.js");
const factory = require("./factory.controller.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const { sendContactEmail } = require("../services/email.service.js");
const { sendAdminNotification } = require("../services/fcm.service.js");

exports.createContactMessage = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    subject: req.body.subject || "",
    message: req.body.message,
    page: req.body.page || "",
    source: req.body.source || "portfolio-website",
    status: "new",
    isRead: false,
    ipAddress: req.ip || "",
    userAgent: req.get("user-agent") || "",
  };

  const doc = await Contact.create(payload);

  const notification = await Notification.create({
    type: "contact",
    title: `New contact from ${doc.name}`,
    message: doc.subject || doc.message.slice(0, 120),
    contact: doc._id,
    link: "/contacts",
    meta: {
      email: doc.email,
      phone: doc.phone,
      page: doc.page,
    },
  });

  try {
    await sendContactEmail(doc);
  } catch (error) {
    console.error("Contact email failed:", error.message);
  }

  try {
    await sendAdminNotification({
      title: `New contact from ${doc.name}`,
      body: doc.subject || doc.message.slice(0, 120),
      link: "/contacts",
      data: {
        contactId: String(doc._id),
        name: doc.name,
        email: doc.email,
      },
    });
  } catch (error) {
    console.error("Firebase push notification failed:", error.message);
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", { contact: doc, notification }));
});

exports.getContactMessage = factory.getOne(Contact);
exports.getAllContactMessages = factory.getAll(Contact);
exports.deleteContactMessage = factory.deleteOne(Contact);

exports.updateContactMessage = asyncHandler(async (req, res) => {
  const doc = await Contact.findById(req.params.id);

  if (!doc) {
    throw new ApiError(404, "No document found with that ID");
  }

  Object.assign(doc, req.body);

  if (req.body.status) {
    doc.isRead = req.body.status !== "new";
    if (req.body.status === "replied" && !doc.repliedAt) {
      doc.repliedAt = new Date();
    }
  }

  if (typeof req.body.isRead === "boolean") {
    doc.isRead = req.body.isRead;
  }

  await doc.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Message updated successfully", doc));
});
