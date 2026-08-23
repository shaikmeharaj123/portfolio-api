const GmailConnection = require("../models/GmailConnection.js");
const logger = require("../utils/logger.js");

const migrateGmailIndexes = async () => {
  const indexes = await GmailConnection.collection.indexes();
  if (indexes.some((index) => index.name === "admin_1")) {
    await GmailConnection.collection.dropIndex("admin_1");
    logger.info("Removed legacy Gmail admin-only unique index");
  }

  const duplicateGroups = await GmailConnection.aggregate([
    { $match: { admin: { $exists: true }, gmailAddress: { $exists: true } } },
    { $group: { _id: { admin: "$admin", gmailAddress: "$gmailAddress" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const group of duplicateGroups) {
    const duplicateIds = group.ids.slice(1);
    if (duplicateIds.length) await GmailConnection.deleteMany({ _id: { $in: duplicateIds } });
  }
  if (duplicateGroups.length) logger.info(`Removed ${duplicateGroups.length} duplicate Gmail account group(s)`);

  await GmailConnection.syncIndexes();
};

module.exports = { migrateGmailIndexes };
