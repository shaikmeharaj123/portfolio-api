const mongoose = require("mongoose");

const ocrFavoriteSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    favoriteType: { type: String, enum: ["question", "folder"], required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionAnswer" },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "OCRFolder" },
  },
  { timestamps: true, versionKey: false }
);

ocrFavoriteSchema.index({ admin: 1, favoriteType: 1, questionId: 1 }, { unique: true, partialFilterExpression: { favoriteType: "question", questionId: { $exists: true } } });
ocrFavoriteSchema.index({ admin: 1, favoriteType: 1, folderId: 1 }, { unique: true, partialFilterExpression: { favoriteType: "folder", folderId: { $exists: true } } });

module.exports = mongoose.model("OCRFavorite", ocrFavoriteSchema);
