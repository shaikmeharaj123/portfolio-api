const mongoose = require("mongoose");

const CONTENT_TYPES = ["interview-question", "coding-question"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const SOURCES = ["Book", "Camera OCR", "Image Upload", "PDF", "OCR", "Manual Entry", "Interview", "Website", "Personal Notes", "Other"];
const PROGRAMMING_LANGUAGES = ["JavaScript"];

const exampleSchema = new mongoose.Schema(
  { input: { type: String, default: "" }, output: { type: String, default: "" }, explanation: { type: String, default: "" } },
  { _id: false }
);

const ocrInterviewQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 240, default: "" },
    contentType: { type: String, enum: CONTENT_TYPES, default: "general-note" },
    question: { type: String, trim: true, default: "" },
    answer: { type: String, default: "" },
    explanation: { type: String, default: "" },
    content: { type: String, default: "" },
    category: { type: String, trim: true, default: "General" },
    subCategory: { type: String, trim: true, default: "" },
    topic: { type: String, trim: true, default: "" },
    difficulty: { type: String, enum: DIFFICULTIES, default: "Medium" },
    tags: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    source: { type: String, enum: SOURCES, default: "Manual Entry" },
    sourceName: { type: String, trim: true, default: "" },
    sourcePage: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, trim: true, default: "" },
    originalFileName: { type: String, trim: true, default: "" },
    originalText: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    problemStatement: { type: String, default: "" },
    inputDescription: { type: String, default: "" },
    outputDescription: { type: String, default: "" },
    constraints: { type: String, default: "" },
    examples: { type: [exampleSchema], default: [] },
    starterCode: { type: String, default: "" },
    solutionCode: { type: String, default: "" },
    programmingLanguage: { type: String, enum: PROGRAMMING_LANGUAGES, default: "JavaScript" },
    expectedOutput: { type: String, default: "" },
    recruiterName: { type: String, trim: true, default: "" },
    recruiterMobile: { type: String, trim: true, default: "" },
    recruiterEmail: { type: String, trim: true, lowercase: true, default: "" },
    recruiterDesignation: { type: String, trim: true, default: "" },
    recruiterCompany: { type: String, trim: true, default: "" },
    recruiterLinkedIn: { type: String, trim: true, default: "" },
    recruiterNotes: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

ocrInterviewQuestionSchema.index({ contentType: 1, category: 1, difficulty: 1, createdAt: -1 });
ocrInterviewQuestionSchema.index({ title: "text", question: "text", content: "text", problemStatement: "text", topic: "text", skills: "text" });
ocrInterviewQuestionSchema.statics.contentTypes = CONTENT_TYPES;
ocrInterviewQuestionSchema.statics.difficulties = DIFFICULTIES;
ocrInterviewQuestionSchema.statics.sources = SOURCES;

module.exports = mongoose.model("OCRInterviewQuestion", ocrInterviewQuestionSchema);
