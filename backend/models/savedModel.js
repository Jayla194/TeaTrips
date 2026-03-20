// Model functions for saving and unsaving locations for logged-in users
const db = require("../config/db");

async function saveLocation(user_id, location_id) {
    const [result] = await db.query(
        "INSERT INTO saved_locations (user_id, location_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = created_at",
        [user_id, location_id]
    );
    return result;
}

async function unsaveLocation(user_id, location_id) {
    const [result] = await db.query(
        "DELETE FROM saved_locations WHERE user_id = ? AND location_id = ?",
        [user_id, location_id]
    );
    return result;
}

async function getSavedLocations(user_id) {
    const [rows] = await db.query(
        `
        SELECT loc.*
        FROM saved_locations save
        JOIN locations loc ON loc.id = save.location_id
        WHERE save.user_id = ?
        ORDER BY save.created_at DESC
        `,
        [user_id]
    );
    return rows;
}

module.exports = {
    saveLocation,
    unsaveLocation,
    getSavedLocations,
};
