const db = require("../config/db");


// Get all locations
async function getAllLocations(){
    const [rows] = await db.query("SELECT * FROM locations");
    return rows;
}

async function getLocationById(id){
    const [rows] = await db.query("SELECT * FROM locations WHERE id = ?", [id]);
    return rows[0];
}

async function getLocationsByCity(city){
    const [rows] = await db.query("SELECT * FROM locations WHERE city = ?", [city]);
    return rows;
}

async function getAllCities(){
    const [rows] = await db.query("SELECT DISTINCT city FROM locations WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC");
    return rows.map((row) => row.city);
}

async function getHotelsByCity(city){
    const [rows] = await db.query("SELECT * FROM locations WHERE city = ? AND type = ?",[city,"hotel"]);
    console.log("City:", city, "Hotels found:", rows.length);
    return rows;
}

async function getLocationsByCityWithSavedStats(city) {
    const [rows] = await db.query(
        `
        SELECT
        loc.*,
        COUNT(saveloc.location_id) AS saved_count
        FROM locations loc
        LEFT JOIN saved_locations saveloc ON saveloc.location_id = loc.id
        WHERE loc.city = ?
        GROUP BY loc.id
        `,
        [city]
    );
    return rows;
}


module.exports = {
    getAllLocations,
    getLocationById,
    getLocationsByCity,
    getAllCities,
    getHotelsByCity,
    getLocationsByCityWithSavedStats,
};
