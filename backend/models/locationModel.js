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
async function getHotelsByCity(city){
    const [rows] = await db.query("SELECT * FROM locations WHERE city = ? AND type = ?",[city,"hotel"]);
    console.log("City:", city, "Hotels found:", rows.length);
    return rows;
}

module.exports = {
    getAllLocations,
    getLocationById,
    getLocationsByCity,
    getHotelsByCity,
};


