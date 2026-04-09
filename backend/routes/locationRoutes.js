const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// --- Routes ---
router.get("/", locationController.getAll);
router.get("/cities", locationController.getCities);
router.get("/popular", locationController.getPopularLocations);
router.get("/:id/similar", locationController.getSimilarLocations);
router.get("/:id/description", locationController.getDescription);
router.get("/:id", locationController.getById);




module.exports = router;
