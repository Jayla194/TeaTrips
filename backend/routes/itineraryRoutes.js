const express = require("express");
const router = express.Router();

const requireLogin = require("../controllers/requireLogin");
const {
    generatePublicItinerary,
    saveItinerary,
    listUserItineraries,
    getUserItinerary,
    updateUserItinerary,
    removeItinerary,
} = require("../controllers/itineraryController");

router.post("/generate", generatePublicItinerary);
router.post("/save", requireLogin, saveItinerary);
router.get("/", requireLogin, listUserItineraries);
router.get("/:itineraryId", requireLogin, getUserItinerary);
router.put("/:itineraryId", requireLogin, updateUserItinerary);
router.delete("/:itineraryId", requireLogin, removeItinerary);




module.exports = router;
