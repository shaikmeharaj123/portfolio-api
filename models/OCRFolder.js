const mongoose = require("mongoose");

const ocrFolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionAnswer" }],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("OCRFolder", ocrFolderSchema);
