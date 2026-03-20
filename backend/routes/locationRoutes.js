const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// --- Routes ---
router.get("/", locationController.getAll);
router.get("/cities", locationController.getCities);
router.get("/:id", locationController.getById);

module.exports = router;
