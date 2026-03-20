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
    getItineraryStops,
    getItineraryDays,
    deleteItinerary,
}
