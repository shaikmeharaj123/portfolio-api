const { Router } = require("express");
const authRoutes = require("./auth.routes.js");
const projectRoutes = require("./project.routes.js");
const contactRoutes = require("./contact.routes.js");
const notificationRoutes = require("./notification.routes.js");
const uploadRoutes = require("./upload.routes.js");
const appliedCompanyRoutes = require("./appliedCompany.routes.js");
const ocrInterviewQuestionRoutes = require("./ocrInterviewQuestion.routes.js");
const gmailRoutes = require("./gmail.routes.js");
const jobApplicationRoutes = require("./jobApplication.routes.js");
const jobAutomationRoutes = require("./jobAutomation.routes.js");
const resumeRoutes = require("./resume.routes.js");

const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const resourceControllers = require("../controllers/resource.controllers.js");

const router = Router();

// ADD THIS ROOT ROUTE HANDLER
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      projects: "/api/projects",
      upload: "/api/upload",
      achievements: "/api/achievements",
      blogs: "/api/blogs",
      certifications: "/api/certifications",
      education: "/api/education",
      experience: "/api/experience",
      personalInfo: "/api/personal-info",
      skills: "/api/skills",
      socialLinks: "/api/social-links",
      stats: "/api/stats",
      testimonials: "/api/testimonials",
      contacts: "/api/contacts",
            notifications: "/api/notifications",
      appliedCompanies: "/api/applied-companies",
      ocrInterviewQuestions: "/api/ocr-interview-questions",
      gmail: "/api/gmail",
      jobApplications: "/api/job-applications",
      jobAutomation: "/api/job-automation",
      resumes: "/api/resumes",
      portfolio: "/api/portfolio"

    }
  });
});

// Auth routes
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/contacts", contactRoutes);
router.use("/notifications", notificationRoutes);
router.use("/applied-companies", appliedCompanyRoutes);
router.use("/ocr-interview-questions", ocrInterviewQuestionRoutes);
router.use("/gmail", gmailRoutes);
router.use("/job-applications", jobApplicationRoutes);
router.use("/job-automation", jobAutomationRoutes);
router.use("/resumes", resumeRoutes);

// Portfolio public route
router.get("/portfolio", resourceControllers.getFullPortfolio);
router.get("/portfolio/meta", resourceControllers.getPortfolioMeta);

// Resource Routes Helper
const registerResourceRoutes = (path, pluralPrefix, singularPrefix) => {
  const getAll = resourceControllers[`getAll${pluralPrefix}`];
  const getOne = resourceControllers[`get${singularPrefix}`];
  const create = resourceControllers[`create${singularPrefix}`];
  const update = resourceControllers[`update${singularPrefix}`];
  const remove = resourceControllers[`delete${singularPrefix}`];

  router.route(`/${path}`)
    .get(getAll)
    .post(auth, restrictTo("super_admin", "admin"), create);

  router.route(`/${path}/:id`)
    .get(getOne)
    .patch(auth, restrictTo("super_admin", "admin"), update)
    .delete(auth, restrictTo("super_admin", "admin"), remove);
};

// Register all resources
router.use("/projects", projectRoutes); // Already has custom file
registerResourceRoutes("achievements", "Achievements", "Achievement");
registerResourceRoutes("blogs", "Blogs", "Blog");
registerResourceRoutes("certifications", "Certifications", "Certification");
registerResourceRoutes("education", "Education", "Education");
registerResourceRoutes("experience", "Experience", "Experience");
registerResourceRoutes("personal-info", "PersonalInfo", "PersonalInfo");
// projects handled via projectRoutes above
registerResourceRoutes("skills", "Skills", "Skill");
registerResourceRoutes("social-links", "SocialLinks", "SocialLink");
registerResourceRoutes("stats", "Stats", "Stat");
registerResourceRoutes("testimonials", "Testimonials", "Testimonial");

module.exports = router;
