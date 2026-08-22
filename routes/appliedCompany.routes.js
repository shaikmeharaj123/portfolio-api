const { Router } = require("express");
const auth = require("../middleware/auth.js");
const { restrictTo } = require("../middleware/admin.js");
const {
  createAppliedCompany,
  getAppliedCompanies,
  getAppliedCompany,
  updateAppliedCompany,
  deleteAppliedCompany,
  updateAppliedCompanyStatus,
} = require("../controllers/appliedCompany.controller.js");

const router = Router();
const adminOnly = [auth, restrictTo("super_admin", "admin")];

router
  .route("/")
  .get(...adminOnly, getAppliedCompanies)
  .post(...adminOnly, createAppliedCompany);

router
  .route("/:id")
  .get(...adminOnly, getAppliedCompany)
  .patch(...adminOnly, updateAppliedCompany)
  .put(...adminOnly, updateAppliedCompany)
  .delete(...adminOnly, deleteAppliedCompany);

router.patch("/:id/status", ...adminOnly, updateAppliedCompanyStatus);

module.exports = router;
