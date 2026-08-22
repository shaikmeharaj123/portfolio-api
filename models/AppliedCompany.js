const mongoose = require("mongoose");

const STATUS_VALUES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Offer Received",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

const WORK_MODE_VALUES = ["Remote", "Hybrid", "On-site", "Other"];
const EMPLOYMENT_TYPE_VALUES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Temporary",
  "Other",
];

const optionalUrl = {
  type: String,
  trim: true,
  default: "",
  validate: {
    validator: (value) => !value || /^https?:\/\/.+/i.test(value),
    message: "Please provide a valid URL beginning with http:// or https://",
  },
};

const appliedCompanySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, maxlength: 150 },
    companyLogo: optionalUrl,
    jobTitle: { type: String, required: true, trim: true, maxlength: 200 },
    jobUrl: optionalUrl,
    companyWebsite: optionalUrl,
    location: { type: String, trim: true, maxlength: 150, default: "" },
    workMode: { type: String, enum: WORK_MODE_VALUES, default: "Other" },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPE_VALUES,
      default: "Full-time",
    },
    salary: { type: String, trim: true, maxlength: 120, default: "" },
    experience: { type: String, trim: true, maxlength: 120, default: "" },
    skills: { type: [String], default: [] },
    appliedDate: { type: Date, default: Date.now },
    status: { type: String, enum: STATUS_VALUES, default: "Applied" },
    applicationSource: { type: String, trim: true, maxlength: 120, default: "" },
    recruiterName: { type: String, trim: true, maxlength: 150, default: "" },
    recruiterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Please provide a valid recruiter email",
      },
    },
    interviewDate: { type: Date },
    interviewRound: { type: String, trim: true, maxlength: 120, default: "" },
    followUpDate: { type: Date },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
    rejectionReason: { type: String, trim: true, maxlength: 1000, default: "" },
    offerDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

appliedCompanySchema.index({ status: 1, appliedDate: -1 });
appliedCompanySchema.index({ companyName: 1, jobTitle: 1 });
appliedCompanySchema.index({ location: 1, workMode: 1 });

appliedCompanySchema.statics.statusValues = STATUS_VALUES;

module.exports = mongoose.model("AppliedCompany", appliedCompanySchema);
