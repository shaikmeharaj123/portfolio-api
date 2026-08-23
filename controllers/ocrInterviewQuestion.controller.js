const OCRInterviewQuestion = require("../models/OCRInterviewQuestion.js");
const OCRFolder = require("../models/OCRFolder.js");
const OCRFavorite = require("../models/OCRFavorite.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const getPagination = require("../utils/pagination.js");

const allowedFields = ["question", "answer"];
const pickQuestionAnswer = (body = {}) => Object.fromEntries(
  allowedFields.map((field) => [field, typeof body[field] === "string" ? body[field].trim() : body[field]])
);
const validateQuestionAnswer = ({ question, answer }) => {
  if (!question || !answer) throw new ApiError(400, "Question and answer are required.");
};
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const data = pickQuestionAnswer(req.body);
  validateQuestionAnswer(data);
  const duplicate = await OCRInterviewQuestion.findOne({ question: data.question, answer: data.answer });
  if (duplicate && req.query.allowDuplicate !== "true") {
    return res.status(409).json({ success: false, statusCode: 409, message: "This question and answer already exists.", data: { match: duplicate } });
  }
  const doc = await OCRInterviewQuestion.create(data);
  res.status(201).json(new ApiResponse(201, "Question-answer record created successfully", doc));
});

exports.getOCRInterviewQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const search = String(req.query.search || "").trim();
  const filter = search ? { $or: [{ question: { $regex: escapeRegex(search), $options: "i" } }, { answer: { $regex: escapeRegex(search), $options: "i" } }] } : {};
  const [docs, total] = await Promise.all([
    OCRInterviewQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OCRInterviewQuestion.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, "Question-answer records fetched successfully", { docs, total, page, limit, pages: Math.ceil(total / limit) }));
});

exports.getOCRInterviewQuestionIds = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const filter = search ? { $or: [{ question: { $regex: escapeRegex(search), $options: "i" } }, { answer: { $regex: escapeRegex(search), $options: "i" } }] } : {};
  const ids = await OCRInterviewQuestion.find(filter).select("_id").lean();
  res.status(200).json(new ApiResponse(200, "Question-answer IDs fetched successfully", ids.map((item) => item._id)));
});

exports.bulkDeleteOCRInterviewQuestions = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? [...new Set(req.body.ids.filter((id) => /^[a-f\d]{24}$/i.test(String(id))))] : [];
  if (!ids.length) throw new ApiError(400, "Select at least one question-answer record");
  const result = await OCRInterviewQuestion.deleteMany({ _id: { $in: ids } });
  await Promise.all([
    OCRFolder.updateMany({ questionIds: { $in: ids } }, { $pull: { questionIds: { $in: ids } } }),
    OCRFavorite.deleteMany({ favoriteType: "question", questionId: { $in: ids } }),
  ]);
  res.status(200).json(new ApiResponse(200, "Question-answer records deleted successfully", { requested: ids.length, deleted: result.deletedCount }));
});

exports.getOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const doc = await OCRInterviewQuestion.findById(req.params.id);
  if (!doc) throw new ApiError(404, "Question-answer record not found");
  res.status(200).json(new ApiResponse(200, "Question-answer record fetched successfully", doc));
});

exports.updateOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const data = pickQuestionAnswer(req.body);
  validateQuestionAnswer(data);
  const doc = await OCRInterviewQuestion.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true, overwrite: true });
  if (!doc) throw new ApiError(404, "Question-answer record not found");
  res.status(200).json(new ApiResponse(200, "Question-answer record updated successfully", doc));
});

exports.deleteOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const doc = await OCRInterviewQuestion.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, "Question-answer record not found");
  res.status(200).json(new ApiResponse(200, "Question-answer record deleted successfully", null));
});

exports.duplicateOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const source = await OCRInterviewQuestion.findById(req.params.id).lean();
  if (!source) throw new ApiError(404, "Question-answer record not found");
  const duplicate = await OCRInterviewQuestion.create({ question: source.question, answer: source.answer });
  res.status(201).json(new ApiResponse(201, "Question-answer record duplicated successfully", duplicate));
});
