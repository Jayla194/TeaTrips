const express = require("express");
const router = express.Router();

const { generatePublicItinerary } = require("../controllers/itineraryController");

router.post("/generate", generatePublicItinerary);



module.exports = router;