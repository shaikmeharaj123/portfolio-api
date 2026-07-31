const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const getPagination = require("../utils/pagination.js");

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(new ApiResponse(201, "Document created successfully", doc));
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new ApiError(404, "No document found with that ID");
    }

    res.status(200).json(new ApiResponse(200, "Document updated successfully", doc));
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new ApiError(404, "No document found with that ID");
    }

    res.status(200).json(new ApiResponse(200, "Document deleted successfully", null));
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      throw new ApiError(404, "No document found with that ID");
    }

    res.status(200).json(new ApiResponse(200, "Document fetched successfully", doc));
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const filter = req.query.isActive ? { isActive: req.query.isActive === "true" } : {};
    
    const docs = await Model.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Model.countDocuments(filter);

    res.status(200).json(
      new ApiResponse(200, "Documents fetched successfully", {
        docs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      })
    );
  });
