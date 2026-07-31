const Achievement = require("../models/Achievement.js");
const Blog = require("../models/Blog.js");
const Certification = require("../models/Certification.js");
const Education = require("../models/Education.js");
const Experience = require("../models/Experience.js");
const PersonalInfo = require("../models/PersonalInfo.js");
const Role = require("../models/Role.js");
const Skill = require("../models/Skill.js");
const SocialLink = require("../models/SocialLink.js");
const Stat = require("../models/Stat.js");
const Testimonial = require("../models/Testimonial.js");
const factory = require("./factory.controller.js");
const portfolioService = require("../services/portfolio.service.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");

// Specialized Portfolio Controller
exports.getFullPortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.getAllPortfolioData();
  res.status(200).json(new ApiResponse(200, "Portfolio data fetched successfully", data));
});

// Achievement
exports.createAchievement = factory.createOne(Achievement);
exports.updateAchievement = factory.updateOne(Achievement);
exports.deleteAchievement = factory.deleteOne(Achievement);
exports.getAchievement = factory.getOne(Achievement);
exports.getAllAchievements = factory.getAll(Achievement);

// Blog
exports.createBlog = factory.createOne(Blog);
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
exports.getBlog = factory.getOne(Blog);
exports.getAllBlogs = factory.getAll(Blog);

// Certification
exports.createCertification = factory.createOne(Certification);
exports.updateCertification = factory.updateOne(Certification);
exports.deleteCertification = factory.deleteOne(Certification);
exports.getCertification = factory.getOne(Certification);
exports.getAllCertifications = factory.getAll(Certification);

// Education
exports.createEducation = factory.createOne(Education);
exports.updateEducation = factory.updateOne(Education);
exports.deleteEducation = factory.deleteOne(Education);
exports.getEducation = factory.getOne(Education);
exports.getAllEducation = factory.getAll(Education);

// Experience
exports.createExperience = factory.createOne(Experience);
exports.updateExperience = factory.updateOne(Experience);
exports.deleteExperience = factory.deleteOne(Experience);
exports.getExperience = factory.getOne(Experience);
exports.getAllExperience = factory.getAll(Experience);

// PersonalInfo
exports.createPersonalInfo = factory.createOne(PersonalInfo);
exports.updatePersonalInfo = factory.updateOne(PersonalInfo);
exports.deletePersonalInfo = factory.deleteOne(PersonalInfo);
exports.getPersonalInfo = factory.getOne(PersonalInfo);
exports.getAllPersonalInfo = factory.getAll(PersonalInfo);

// Role
exports.createRole = factory.createOne(Role);
exports.updateRole = factory.updateOne(Role);
exports.deleteRole = factory.deleteOne(Role);
exports.getRole = factory.getOne(Role);
exports.getAllRoles = factory.getAll(Role);

// Skill
exports.createSkill = factory.createOne(Skill);
exports.updateSkill = factory.updateOne(Skill);
exports.deleteSkill = factory.deleteOne(Skill);
exports.getSkill = factory.getOne(Skill);
exports.getAllSkills = factory.getAll(Skill);

// SocialLink
exports.createSocialLink = factory.createOne(SocialLink);
exports.updateSocialLink = factory.updateOne(SocialLink);
exports.deleteSocialLink = factory.deleteOne(SocialLink);
exports.getSocialLink = factory.getOne(SocialLink);
exports.getAllSocialLinks = factory.getAll(SocialLink);

// Stat
exports.createStat = factory.createOne(Stat);
exports.updateStat = factory.updateOne(Stat);
exports.deleteStat = factory.deleteOne(Stat);
exports.getStat = factory.getOne(Stat);
exports.getAllStats = factory.getAll(Stat);

// Testimonial
exports.createTestimonial = factory.createOne(Testimonial);
exports.updateTestimonial = factory.updateOne(Testimonial);
exports.deleteTestimonial = factory.deleteOne(Testimonial);
exports.getTestimonial = factory.getOne(Testimonial);
exports.getAllTestimonials = factory.getAll(Testimonial);
