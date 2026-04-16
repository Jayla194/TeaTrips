const express = require("express");
const router = express.Router();
const requireAdmin = require("../controllers/requireAdmin");
const locationController = require("../controllers/locationController");
const reviewController = require("../controllers/reviewController");
const adminController = require("../controllers/adminController");

// Admin only management
router.get("/summary", requireAdmin, adminController.getDashboardStats);
router.get("/locations", requireAdmin, adminController.getAllForAdmin);
router.post("/locations", requireAdmin, locationController.createLocation);
router.get("/reviews", requireAdmin, reviewController.getAllReviews);

module.exports = router;
