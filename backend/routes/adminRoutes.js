const express = require("express");
const router = express.Router();
const requireAdmin = require("../controllers/requireAdmin");
const locationController = require("../controllers/locationControllers");

// Admin only management
