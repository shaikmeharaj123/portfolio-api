const OCRFolder = require("../models/OCRFolder.js");
const OCRFavorite = require("../models/OCRFavorite.js");
const QuestionAnswer = require("../models/OCRInterviewQuestion.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");

const adminId = (req) => req.admin?._id || req.user?._id;
const favoriteKey = (favoriteType, id) => favoriteType === "folder" ? { favoriteType, folderId: id } : { favoriteType: "question", questionId: id };

exports.createFolder = asyncHandler(async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) throw new ApiError(400, "Folder name is required.");
  const folder = await OCRFolder.create({ name, description: typeof req.body.description === "string" ? req.body.description.trim() : "" });
  res.status(201).json(new ApiResponse(201, "OCR folder created successfully", folder));
});

exports.getFolders = asyncHandler(async (req, res) => {
  const folders = await OCRFolder.find().sort({ createdAt: -1 }).lean();
  const favorites = await OCRFavorite.find({ admin: adminId(req), favoriteType: "folder" }).select("folderId -_id").lean();
  const favoriteIds = new Set(favorites.map((favorite) => String(favorite.folderId)));
  res.status(200).json(new ApiResponse(200, "OCR folders fetched successfully", folders.map((folder) => ({ ...folder, questionCount: folder.questionIds.length, isFavorite: favoriteIds.has(String(folder._id)) }))));
});

exports.getFolder = asyncHandler(async (req, res) => {
  const folder = await OCRFolder.findById(req.params.id).populate({ path: "questionIds", select: "question answer createdAt updatedAt" });
  if (!folder) throw new ApiError(404, "OCR folder not found");
  const favorites = await OCRFavorite.find({ admin: adminId(req), favoriteType: "question", questionId: { $in: folder.questionIds.map((item) => item._id) } }).select("questionId -_id").lean();
  const favoriteIds = new Set(favorites.map((favorite) => String(favorite.questionId)));
  const folderFavorite = await OCRFavorite.exists({ admin: adminId(req), favoriteType: "folder", folderId: folder._id });
  const data = folder.toObject();
  data.isFavorite = Boolean(folderFavorite);
  data.questions = data.questionIds.map((question) => ({ ...question, isFavorite: favoriteIds.has(String(question._id)) }));
  delete data.questionIds;
  res.status(200).json(new ApiResponse(200, "OCR folder fetched successfully", data));
});

exports.updateFolder = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body?.name === "string") updates.name = req.body.name.trim();
  if (typeof req.body?.description === "string") updates.description = req.body.description.trim();
  if (!updates.name && !updates.description) throw new ApiError(400, "Folder name or description is required.");
  if (updates.name === "") throw new ApiError(400, "Folder name cannot be empty.");
  const folder = await OCRFolder.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!folder) throw new ApiError(404, "OCR folder not found");
  res.status(200).json(new ApiResponse(200, "OCR folder updated successfully", folder));
});

exports.deleteFolder = asyncHandler(async (req, res) => {
  const folder = await OCRFolder.findByIdAndDelete(req.params.id);
  if (!folder) throw new ApiError(404, "OCR folder not found");
  await OCRFavorite.deleteMany({ folderId: folder._id });
  res.status(200).json(new ApiResponse(200, "OCR folder deleted successfully", null));
});

exports.addQuestionsToFolder = asyncHandler(async (req, res) => {
  const folder = await OCRFolder.findById(req.params.id);
  if (!folder) throw new ApiError(404, "OCR folder not found");
  const ids = Array.isArray(req.body?.questionIds) ? req.body.questionIds : [];
  const validQuestions = await QuestionAnswer.find({ _id: { $in: ids } }).select("_id").lean();
  const validIds = validQuestions.map((question) => String(question._id));
  const existing = new Set(folder.questionIds.map((id) => String(id)));
  validIds.forEach((id) => { if (!existing.has(id)) folder.questionIds.push(id); });
  await folder.save();
  res.status(200).json(new ApiResponse(200, "Questions added to OCR folder successfully", { folderId: folder._id, questionIds: folder.questionIds }));
});

exports.removeQuestionFromFolder = asyncHandler(async (req, res) => {
  const folder = await OCRFolder.findByIdAndUpdate(req.params.id, { $pull: { questionIds: req.params.questionId } }, { new: true });
  if (!folder) throw new ApiError(404, "OCR folder not found");
  res.status(200).json(new ApiResponse(200, "Question removed from OCR folder successfully", { folderId: folder._id, questionIds: folder.questionIds }));
});

exports.toggleFavorite = asyncHandler(async (req, res) => {
  const { favoriteType, id } = req.body || {};
  if (!["question", "folder"].includes(favoriteType) || !id) throw new ApiError(400, "favoriteType and id are required.");
  const exists = favoriteType === "folder" ? await OCRFolder.exists({ _id: id }) : await QuestionAnswer.exists({ _id: id });
  if (!exists) throw new ApiError(404, `${favoriteType === "folder" ? "OCR folder" : "Question-answer record"} not found`);
  const query = { admin: adminId(req), ...favoriteKey(favoriteType, id) };
  const favorite = await OCRFavorite.findOne(query);
  if (favorite) { await favorite.deleteOne(); return res.status(200).json(new ApiResponse(200, "Favorite removed successfully", { favoriteType, id, isFavorite: false })); }
  await OCRFavorite.create(query);
  res.status(201).json(new ApiResponse(201, "Favorite added successfully", { favoriteType, id, isFavorite: true }));
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await OCRFavorite.find({ admin: adminId(req) }).populate("questionId", "question answer createdAt updatedAt").populate("folderId", "name description questionIds createdAt updatedAt").sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, "OCR favorites fetched successfully", favorites));
});
