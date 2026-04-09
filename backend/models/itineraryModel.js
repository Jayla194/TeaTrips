const db = require("../config/db");

async function createItinerary(
    { user_id, trip_name, city, start_date, end_date, hotel_location_id },
    conn = db,
) {
    const [result] = await conn.query(
        "INSERT INTO itineraries (user_id, trip_name, city, start_date, end_date, hotel_location_id) VALUES (?,?,?,?,?,?)",
        [user_id, trip_name, city, start_date, end_date, hotel_location_id],
    );
    return result;
}

async function createItineraryDays(conn, { itinerary_id, day_number, trip_date }) {
    const [result] = await conn.query(
        "INSERT INTO itinerary_days (itinerary_id, day_number, trip_date) VALUES (?,?,?)",
        [itinerary_id, day_number, trip_date],
    );
    return result;
}

async function createItineraryStop(
    conn,
    { itinerary_day_id, location_id, stop_position, start_time, end_time, notes },
) {
    const [result] = await conn.query(
        "INSERT INTO itinerary_stops (itinerary_day_id, location_id, stop_position, start_time, end_time, notes) VALUES (?,?,?,?,?,?)",
        [itinerary_day_id, location_id, stop_position, start_time, end_time, notes],
    );
    return result;
}



// Used on the profile page to load all user itineraries
async function getUserItineraries(user_id){
    const [rows] = await db.query(
        "SELECT * FROM itineraries WHERE user_id = ?",[user_id]
    );
    return rows;
}

async function getItineraryDays(conn,itinerary_id){
    const [rows] = await conn.query(
        "SELECT * FROM itinerary_days WHERE itinerary_id = ?",[itinerary_id]
    );
    return rows;
}

async function getItineraryStops(conn,itinerary_id){
    const [rows] = await conn.query(
        `
        SELECT s.*
        FROM itinerary_stops s
        JOIN itinerary_days d ON d.itinerary_day_id = s.itinerary_day_id
        WHERE d.itinerary_id = ?
        ORDER BY d.day_number ASC, s.stop_position ASC
        `,
        [itinerary_id],
    );
    return rows;
}

async function getUserItineraryById(itinerary_id, user_id, conn = db) {
    const [rows] = await conn.query(
        "SELECT * FROM itineraries WHERE itinerary_id = ? AND user_id = ?",
        [itinerary_id, user_id],
    );
    return rows[0] || null;
}

async function getItineraryStopsWithLocations(itinerary_id, conn = db) {
    const [rows] = await conn.query(
        `
        SELECT
            d.day_number,
            d.trip_date,
            s.stop_position,
            l.id,
            l.name,
            l.type,
            l.lat,
            l.lon,
            l.avg_rating,
            l.image_url,
            l.address,
            l.city,
            l.tags
        FROM itinerary_days d
        LEFT JOIN itinerary_stops s ON s.itinerary_day_id = d.itinerary_day_id
        LEFT JOIN locations l ON l.id = s.location_id
        WHERE d.itinerary_id = ?
        ORDER BY d.day_number ASC, s.stop_position ASC
        `,
        [itinerary_id],
    );
    return rows;
}

async function updateItineraryHeader(
    conn,
    { itinerary_id, user_id, trip_name, city, start_date, end_date, hotel_location_id },
) {
    const [result] = await conn.query(
        `
        UPDATE itineraries
        SET trip_name = ?, city = ?, start_date = ?, end_date = ?, hotel_location_id = ?
        WHERE itinerary_id = ? AND user_id = ?
        `,
        [trip_name, city, start_date, end_date, hotel_location_id, itinerary_id, user_id],
    );
    return result;
}

async function deleteItineraryDaysByItineraryId(conn, itinerary_id) {
    const [result] = await conn.query(
        "DELETE FROM itinerary_days WHERE itinerary_id = ?",
        [itinerary_id],
    );
    return result;
}

async function deleteItinerary(itinerary_id,user_id){
    const [result] = await db.query(
        "DELETE FROM itineraries WHERE itinerary_id = ? AND user_id = ?",
        [itinerary_id, user_id],
    );
    return result;
}



module.exports = {
    createItinerary,
    createItineraryDays,
    createItineraryStop,
    getUserItineraries,
    getUserItineraryById,
    getItineraryStops,
    getItineraryStopsWithLocations,
    getItineraryDays,
    updateItineraryHeader,
    deleteItineraryDaysByItineraryId,
    deleteItinerary,
}
