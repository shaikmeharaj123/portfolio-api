const OCRInterviewQuestion = require("../models/OCRInterviewQuestion.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const getPagination = require("../utils/pagination.js");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildFilter = (query) => {
  const filter = {};
  const search = String(query.search || "").trim();
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: expression }, { question: expression }, { content: expression }, { problemStatement: expression }, { topic: expression }, { skills: expression }, { tags: expression }];
  }
  ["contentType", "category", "subCategory", "topic", "difficulty", "programmingLanguage", "source"].forEach((key) => {
    if (query[key] && query[key] !== "all") filter[key] = query[key];
  });
  return filter;
};
const sortFields = ["title", "category", "topic", "difficulty", "contentType", "createdAt", "updatedAt"];
const contentText = (body) => [body.question, body.content, body.problemStatement].filter(Boolean).join(" ").trim();

exports.createOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const sourceText = contentText(req.body);
  if (sourceText && req.query.allowDuplicate !== "true") {
    const similar = await OCRInterviewQuestion.find({ $or: [{ question: { $regex: escapeRegex(sourceText.slice(0, 120)), $options: "i" } }, { problemStatement: { $regex: escapeRegex(sourceText.slice(0, 120)), $options: "i" } }] }).limit(5);
    if (similar.length) {
      return res.status(409).json({ success: false, statusCode: 409, message: "Similar question already exists.", data: { matches: similar } });
    }
  }
  const doc = await OCRInterviewQuestion.create(req.body);
  res.status(201).json(new ApiResponse(201, "OCR knowledge record created successfully", doc));
});

exports.getOCRInterviewQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = buildFilter(req.query);
  const sortBy = sortFields.includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const [docs, total] = await Promise.all([OCRInterviewQuestion.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit), OCRInterviewQuestion.countDocuments(filter)]);
  res.status(200).json(new ApiResponse(200, "OCR knowledge records fetched successfully", { docs, total, page, limit, pages: Math.ceil(total / limit) }));
});

exports.getOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const doc = await OCRInterviewQuestion.findById(req.params.id);
  if (!doc) throw new ApiError(404, "OCR knowledge record not found");
  res.status(200).json(new ApiResponse(200, "OCR knowledge record fetched successfully", doc));
});
exports.updateOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const doc = await OCRInterviewQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, "OCR knowledge record not found");
  res.status(200).json(new ApiResponse(200, "OCR knowledge record updated successfully", doc));
});
exports.deleteOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const doc = await OCRInterviewQuestion.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, "OCR knowledge record not found");
  res.status(200).json(new ApiResponse(200, "OCR knowledge record deleted successfully", null));
});
exports.duplicateOCRInterviewQuestion = asyncHandler(async (req, res) => {
  const source = await OCRInterviewQuestion.findById(req.params.id).lean();
  if (!source) throw new ApiError(404, "OCR knowledge record not found");
  delete source._id; delete source.createdAt; delete source.updatedAt;
  const duplicate = await OCRInterviewQuestion.create({ ...source, title: source.title ? `${source.title} (Copy)` : "Untitled Copy" });
  res.status(201).json(new ApiResponse(201, "OCR knowledge record duplicated successfully", duplicate));
});
