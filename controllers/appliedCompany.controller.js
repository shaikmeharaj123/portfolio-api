const AppliedCompany = require("../models/AppliedCompany.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const getPagination = require("../utils/pagination.js");

const buildStats = (records) => {
  const counts = records.reduce((result, record) => {
    result[record._id] = record.count;
    return result;
  }, {});

  return {
    totalApplications: Object.values(counts).reduce((sum, value) => sum + value, 0),
    applied: counts.Applied || 0,
    underReview: counts["Under Review"] || 0,
    shortlisted: counts.Shortlisted || 0,
    interviews: counts.Interview || 0,
    selected: counts.Selected || 0,
    offers: counts["Offer Received"] || 0,
    rejected: counts.Rejected || 0,
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = (query) => {
  const filter = {};
  const search = String(query.search || query.q || "").trim();

  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ companyName: expression }, { jobTitle: expression }];
  }
  if (query.companyName) filter.companyName = new RegExp(escapeRegex(query.companyName), "i");
  if (query.jobTitle) filter.jobTitle = new RegExp(escapeRegex(query.jobTitle), "i");
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.location) filter.location = new RegExp(escapeRegex(query.location), "i");
  if (query.workMode && query.workMode !== "all") filter.workMode = query.workMode;

  if (query.appliedDateFrom || query.appliedDateTo) {
    filter.appliedDate = {};
    if (query.appliedDateFrom) filter.appliedDate.$gte = new Date(`${query.appliedDateFrom}T00:00:00.000Z`);
    if (query.appliedDateTo) filter.appliedDate.$lte = new Date(`${query.appliedDateTo}T23:59:59.999Z`);
  }

  return filter;
};

const allowedSortFields = [
  "companyName",
  "jobTitle",
  "location",
  "workMode",
  "appliedDate",
  "status",
  "interviewDate",
  "followUpDate",
  "createdAt",
  "updatedAt",
];

exports.createAppliedCompany = asyncHandler(async (req, res) => {
  const doc = await AppliedCompany.create(req.body);
  res.status(201).json(new ApiResponse(201, "Applied company created successfully", doc));
});

exports.getAppliedCompanies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = buildFilter(req.query);
  const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : "appliedDate";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder, createdAt: -1 };

  const [docs, total, groupedStats] = await Promise.all([
    AppliedCompany.find(filter).sort(sort).skip(skip).limit(limit),
    AppliedCompany.countDocuments(filter),
    AppliedCompany.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Applied companies fetched successfully", {
      docs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      stats: buildStats(groupedStats),
    })
  );
});

exports.getAppliedCompany = asyncHandler(async (req, res) => {
  const doc = await AppliedCompany.findById(req.params.id);
  if (!doc) throw new ApiError(404, "Applied company not found");
  res.status(200).json(new ApiResponse(200, "Applied company fetched successfully", doc));
});

exports.updateAppliedCompany = asyncHandler(async (req, res) => {
  const doc = await AppliedCompany.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new ApiError(404, "Applied company not found");
  res.status(200).json(new ApiResponse(200, "Applied company updated successfully", doc));
});

exports.deleteAppliedCompany = asyncHandler(async (req, res) => {
  const doc = await AppliedCompany.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, "Applied company not found");
  res.status(200).json(new ApiResponse(200, "Applied company deleted successfully", null));
});

exports.updateAppliedCompanyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!AppliedCompany.statusValues.includes(status)) {
    throw new ApiError(400, `Invalid status. Use one of: ${AppliedCompany.statusValues.join(", ")}`);
  }

  const doc = await AppliedCompany.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!doc) throw new ApiError(404, "Applied company not found");
  res.status(200).json(new ApiResponse(200, "Applied company status updated successfully", doc));
});
