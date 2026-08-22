const Admin = require("../models/Admin.js");
const initFirebaseAdmin = require("../utils/firebaseAdmin.js");

const getMessaging = () => initFirebaseAdmin().messaging();

const sanitizeTokens = (tokens = []) =>
  Array.from(
    new Set(
      tokens
        .filter(Boolean)
        .map((token) => String(token).trim())
        .filter((token) => token.length > 0)
    )
  );

const registerAdminToken = async (adminId, token) => {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) return null;

  await Admin.findByIdAndUpdate(adminId, {
    $addToSet: { fcmTokens: cleanToken },
  });

  return cleanToken;
};

const removeAdminToken = async (adminId, token) => {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) return null;

  await Admin.findByIdAndUpdate(adminId, {
    $pull: { fcmTokens: cleanToken },
  });

  return cleanToken;
};

const sendAdminNotification = async ({ title, body, link, data = {} }) => {
  const admins = await Admin.find({
    isActive: true,
    fcmTokens: { $exists: true, $ne: [] },
  }).select("+fcmTokens");

  const tokens = sanitizeTokens(admins.flatMap((admin) => admin.fcmTokens || []));

  if (!tokens.length) {
    return { successCount: 0, failureCount: 0, skipped: true };
  }

  const messaging = getMessaging();
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    data: Object.entries({
      link: link || "/contacts",
      type: "contact",
      ...data,
    }).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {}),
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
};

module.exports = {
  registerAdminToken,
  removeAdminToken,
  sendAdminNotification,
};
