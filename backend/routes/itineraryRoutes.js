const express = require("express");
const router = express.Router();

const requireLogin = require("../controllers/requireLogin");
const {
    generatePublicItinerary,
    saveItinerary,
    listUserItineraries,
    removeItinerary,
} = require("../controllers/itineraryController");

router.post("/generate", generatePublicItinerary);
router.post("/save", requireLogin, saveItinerary);
router.get("/", requireLogin, listUserItineraries);
router.delete("/:itineraryId", requireLogin, removeItinerary);




module.exports = router;
