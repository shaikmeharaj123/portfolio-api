const Achievement = require("../models/Achievement.js");
const Blog = require("../models/Blog.js");
const Certification = require("../models/Certification.js");
const Education = require("../models/Education.js");
const Experience = require("../models/Experience.js");
const PersonalInfo = require("../models/PersonalInfo.js");
const Project = require("../models/Project.js");
const Skill = require("../models/Skill.js");
const SocialLink = require("../models/SocialLink.js");
const Stat = require("../models/Stat.js");
const Testimonial = require("../models/Testimonial.js");

class PortfolioService {
  async getModel(Model, query = { isActive: true }) {
    return await Model.find(query).sort({ order: 1, createdAt: -1 });
  }

  async getLatestUpdatedAt() {
    const models = [
      PersonalInfo,
      Project,
      Skill,
      Experience,
      Education,
      Blog,
      Achievement,
      Certification,
      SocialLink,
      Stat,
      Testimonial,
    ];

    const timestamps = await Promise.all(
      models.map(async (Model) => {
        const doc = await Model.findOne().sort({ updatedAt: -1 }).select("updatedAt");
        return doc?.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
      })
    );

    return Math.max(...timestamps);
  }

  async getAllPortfolioData() {
    const [
      personalInfo,
      projects,
      skills,
      experience,
      education,
      blogs,
      achievements,
      certifications,
      socialLinks,
      stats,
      testimonials
    ] = await Promise.all([
      PersonalInfo.findOne({ isActive: true }),
      this.getModel(Project),
      this.getModel(Skill),
      this.getModel(Experience),
      this.getModel(Education),
      this.getModel(Blog),
      this.getModel(Achievement),
      this.getModel(Certification),
      this.getModel(SocialLink),
      this.getModel(Stat),
      this.getModel(Testimonial)
    ]);

    return {
      personalInfo,
      projects,
      skills,
      experience,
      education,
      blogs,
      achievements,
      certifications,
      socialLinks,
      stats,
      testimonials
    };
  }

  async getPortfolioMeta() {
    const lastUpdatedAt = await this.getLatestUpdatedAt();

    return {
      version: lastUpdatedAt ? new Date(lastUpdatedAt).toISOString() : null,
      lastUpdatedAt: lastUpdatedAt ? new Date(lastUpdatedAt).toISOString() : null,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new PortfolioService();
