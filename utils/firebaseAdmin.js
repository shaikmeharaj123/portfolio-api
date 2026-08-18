const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

let initialized = false;

const loadServiceAccount = () => {
  const customPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const fallbackPath = path.join(
    __dirname,
    "..",
    "portfolio-9fbee-firebase-adminsdk-fbsvc-ffd696e252.json"
  );
  const serviceAccountPath = customPath
    ? path.isAbsolute(customPath)
      ? customPath
      : path.join(process.cwd(), customPath)
    : fallbackPath;

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase service account file not found at ${serviceAccountPath}`
    );
  }

  return require(serviceAccountPath);
};

const initFirebaseAdmin = () => {
  if (initialized) return admin;

  const serviceAccount = loadServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin;
};

module.exports = initFirebaseAdmin;
