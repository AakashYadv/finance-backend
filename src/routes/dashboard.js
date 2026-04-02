const express = require("express");
const router = express.Router();
const { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends, getRecentActivity } = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
const allRoles = authorize("viewer", "analyst", "admin");
router.get("/summary", allRoles, getSummary);
router.get("/category-breakdown", allRoles, getCategoryBreakdown);
router.get("/monthly-trends", allRoles, getMonthlyTrends);
router.get("/weekly-trends", allRoles, getWeeklyTrends);
router.get("/recent-activity", allRoles, getRecentActivity);

module.exports = router;
