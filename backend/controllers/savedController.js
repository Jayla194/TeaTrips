// handles saving and unsaving locations for logged-in users
const {
    saveLocation: saveLocationModel,
    unsaveLocation: unsaveLocationModel,
    getSavedLocations: getSavedLocationsModel,
} = require("../models/savedModel");

// Save a location for the user
async function saveLocation(req, res) {
    const userId = req.user.user_id;
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId)) {
        return res.status(400).json({ message: "Invalid locationId" });
    }

    try {
        await saveLocationModel(userId, locationId);
        return res.status(201).json({ message: "Location saved" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error saving location" });
    }
}

// Unsave a location for the user
async function unsaveLocation(req, res) {
    const userId = req.user.user_id;
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId)) {
        return res.status(400).json({ message: "Invalid locationId" });
    }

    try {
        const unsaveResult = await unsaveLocationModel(userId, locationId);
        if (unsaveResult.affectedRows === 0) {
        return res.status(404).json({ message: "Location not saved" });
        }
        return res.json({ message: "Location removed" });
    } catch (err) {
        return res.status(500).json({ message: "Error removing location" });
    }
}

// Get all saved locations for the user
async function getSavedLocations(req, res) {
    const userId = req.user.user_id;

    try {
        const rows = await getSavedLocationsModel(userId);
        return res.json(rows);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching saved locations" });
    }
}

module.exports = {
    saveLocation,
    unsaveLocation,
    getSavedLocations,
};
