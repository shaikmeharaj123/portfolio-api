const mongoose = require("mongoose");
const resumeSchema = new mongoose.Schema({ admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true }, name: { type: String, required: true, trim: true }, type: { type: String, trim: true, default: "" }, description: { type: String, trim: true, default: "" }, focusSkills: { type: [String], default: [] }, fileUrl: { type: String, required: true }, fileName: { type: String, default: "" }, isDefault: { type: Boolean, default: false }, uploadedAt: { type: Date, default: Date.now } }, { timestamps: true, versionKey: false });
resumeSchema.index({ admin: 1, name: 1 });
module.exports = mongoose.model("Resume", resumeSchema);
