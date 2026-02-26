const express = require("express");
const router = express.Router();
const locationModel  = require("../models/locationModel");
const locationController = require("../controllers/locationController");

// --- Route 1 Get all locations ---
// Endpoint: GET /api/locations

router.get("/", locationController.getAll);
router.get("/:id", locationController.getById);


module.exports = router;