const crypto = require("crypto");
const { URLSearchParams } = require("url");
const ApiError = require("../utils/ApiError.js");

const oauthConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const splitKeyList = (value) =>
  String(value || "")
    .split(/[;,]/)
    .map((key) => key.trim())
    .filter(Boolean);

const getEncryptionKeyCandidates = () => {
  const candidates = [];
  const primaryKey = process.env.GMAIL_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (primaryKey) candidates.push(primaryKey);

  for (const legacyKey of splitKeyList(process.env.GMAIL_TOKEN_LEGACY_ENCRYPTION_KEYS)) {
    if (!candidates.includes(legacyKey)) candidates.push(legacyKey);
  }

  if (process.env.JWT_SECRET && !candidates.includes(process.env.JWT_SECRET)) {
    candidates.push(process.env.JWT_SECRET);
  }

  return candidates;
};

const toAesKey = (value) => crypto.createHash("sha256").update(value).digest();

const getPrimaryEncryptionKey = () => {
  const value = process.env.GMAIL_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!value) {
    throw new ApiError(
      500,
      "Gmail token encryption is not configured; set GMAIL_TOKEN_ENCRYPTION_KEY (or JWT_SECRET for local development)",
    );
  }

  return toAesKey(value);
};

const encrypt = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getPrimaryEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);

  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
};

const decryptWithKey = (value, key) => {
  const [iv, tag, encrypted] = String(value || "").split(".");
  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted payload");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

const decrypt = (value) => {
  const candidates = getEncryptionKeyCandidates();
  if (!candidates.length) {
    throw new ApiError(
      500,
      "Gmail token encryption is not configured; set GMAIL_TOKEN_ENCRYPTION_KEY (or JWT_SECRET for local development)",
    );
  }

  let lastError;
  for (const candidate of candidates) {
    try {
      return decryptWithKey(value, toAesKey(candidate));
    } catch (error) {
      lastError = error;
    }
  }

  throw new ApiError(
    401,
    "Stored Gmail credentials could not be decrypted. Reconnect Gmail to refresh the saved tokens.",
    [lastError?.message || "Unable to decrypt stored Gmail credentials"],
  );
};

const assertConfig = () => {
  const config = oauthConfig();
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new ApiError(500, "Google OAuth is not configured");
  }
  return config;
};

const getAuthUrl = (state) => {
  const config = assertConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

const exchangeCode = async (code) => {
  const config = assertConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) throw new ApiError(502, "Google OAuth token exchange failed");
  return response.json();
};

const refreshAccessToken = async (connection) => {
  const config = assertConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: decrypt(connection.encryptedRefreshToken),
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) throw new ApiError(401, "Gmail authorization expired; reconnect Gmail");

  const data = await response.json();
  connection.encryptedAccessToken = encrypt(data.access_token);
  connection.tokenExpiryDate = new Date(Date.now() + (data.expires_in || 3600) * 1000);
  await connection.save();
  return data.access_token;
};

const gmailRequest = async (connection, path, options = {}) => {
  let accessToken;

  try {
    accessToken = decrypt(connection.encryptedAccessToken);
  } catch (error) {
    accessToken = await refreshAccessToken(connection);
  }

  if (!connection.tokenExpiryDate || connection.tokenExpiryDate <= new Date(Date.now() + 60000)) {
    accessToken = await refreshAccessToken(connection);
  }

  let response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) },
  });

  if (response.status === 401) {
    accessToken = await refreshAccessToken(connection);
    response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) },
    });
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? 404 : 502,
      response.status === 404 ? "Gmail resource not found" : "Gmail API request failed",
    );
  }

  return response.json();
};

const getProfile = (connection) => gmailRequest(connection, "profile");
const listMessages = (connection, query, pageToken) =>
  gmailRequest(connection, `messages?maxResults=100&q=${encodeURIComponent(query)}${pageToken ? `&pageToken=${pageToken}` : ""}`);
const getMessage = (connection, id) => gmailRequest(connection, `messages/${id}?format=full`);

const saveConnection = async (adminId, tokenData) => {
  const temporary = {
    encryptedAccessToken: encrypt(tokenData.access_token),
    encryptedRefreshToken: encrypt(tokenData.refresh_token),
    tokenExpiryDate: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
  };

  return temporary;
};

module.exports = {
  getAuthUrl,
  exchangeCode,
  getProfile,
  listMessages,
  getMessage,
  saveConnection,
  refreshAccessToken,
  encrypt,
  decrypt,
};
