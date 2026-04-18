const db = require("../config/db");

// Return all locations
async function getAllLocations() {
    const [rows] = await db.query("SELECT * FROM locations");
    return rows;
}

// Return a single location by ID
async function getLocationById(id) {
    const [rows] = await db.query(
        `
        SELECT
            loc.id,
            loc.name,
            loc.type,
            loc.address,
            loc.city,
            loc.postcode,
            loc.lat,
            loc.lon,
            loc.website,
            loc.phone,
            loc.opening_hours,
            loc.price_tier,
            COALESCE(
                (
                    SELECT ROUND(AVG(r.rating), 1)
                    FROM reviews r
                    WHERE r.location_id = loc.id AND r.is_visible = TRUE
                ),
                loc.avg_rating
            ) AS avg_rating,
            loc.suggested_duration,
            loc.tags,
            loc.image_url,
            loc.description_short,
            loc.description_long,
            loc.description_last_generated,
            loc.review_count_at_generation
        FROM locations loc
        WHERE loc.id = ?
        `,
        [id]
    );
    return rows[0];
}

// Get locations by city api/locations/city/:city
async function getLocationsByCity(city) {
    const [rows] = await db.query("SELECT * FROM locations WHERE city = ?", [city]);
    return rows;
}

// Get all unique cities api/locations/cities
async function getAllCities() {
    const [rows] = await db.query(
        "SELECT DISTINCT city FROM locations WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC"
    );
    return rows.map((row) => row.city);
}

// Return hotels in a city (for itinerary suggestions) api/locations/city/:city/hotels
async function getHotelsByCity(city) {
    const [rows] = await db.query("SELECT * FROM locations WHERE city = ? AND type = ?", [city, "hotel"]);
    return rows;
}

// 
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

// Get most saved locations api/locations/popular
async function getPopularLocations() {
    const [rows] = await db.query(
        `
        SELECT
        loc.*,
        COUNT(saveloc.location_id) AS saved_count
        FROM locations loc
        LEFT JOIN saved_locations saveloc ON saveloc.location_id = loc.id
        GROUP BY loc.id
        ORDER BY saved_count DESC
        `
    );
    return rows;
}


// Update location description upon generation
async function updateLocationDescription(id, payload) {
    const sql = `
        UPDATE locations
        SET description_long = ?,
        review_count_at_generation = ?,
        description_last_generated = ?
        WHERE id = ?
    `;
    await db.query(sql, [payload.description, payload.review_count_at_generation, payload.description_last_generated, id]);
}

// Add a new location (admin)
async function addLocation(locationData) {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [idRows] = await conn.query("SELECT id FROM locations ORDER BY id DESC LIMIT 1 FOR UPDATE");
        const nextId = Number(idRows[0]?.id || 0) + 1;

        const sql = `
            INSERT INTO locations (
                id,
                name,
                type,
                address,
                city,
                postcode,
                lat,
                lon,
                website,
                phone,
                opening_hours,
                price_tier,
                avg_rating,
                suggested_duration,
                tags,
                image_url,
                description_short,
                description_long,
                description_last_generated,
                review_count_at_generation
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await conn.query(sql, [
            nextId,
            locationData.name,
            locationData.type,
            locationData.address,
            locationData.city,
            locationData.postcode,
            locationData.lat,
            locationData.lon,
            locationData.website,
            locationData.phone,
            locationData.opening_hours,
            locationData.price_tier,
            locationData.avg_rating,
            locationData.suggested_duration,
            locationData.tags,
            locationData.image_url,
            locationData.description_short,
            locationData.description_long,
            locationData.description_last_generated,
            locationData.review_count_at_generation,
        ]);

        await conn.commit();
        return nextId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function updateLocation(id, payload) {
    const sql = `
        UPDATE locations
        SET name = ?,
            type = ?,
            address = ?,
            city = ?,
            postcode = ?,
            lat = ?,
            lon = ?,
            website = ?,
            phone = ?,
            opening_hours = ?,
            price_tier = ?,
            avg_rating = ?,
            suggested_duration = ?,
            tags = ?,
            image_url = ?,
            description_short = ?
        WHERE id = ?
    `;
    await db.query(sql, [
        payload.name,
        payload.type,
        payload.address,
        payload.city,
        payload.postcode,
        payload.lat,
        payload.lon,
        payload.website,
        payload.phone,
        payload.opening_hours,
        payload.price_tier,
        payload.avg_rating,
        payload.suggested_duration,
        payload.tags,
        payload.image_url,
        payload.description_short,
        id
    ]);
}


module.exports = {
    getAllLocations,
    getLocationById,
    getLocationsByCity,
    getAllCities,
    getHotelsByCity,
    getLocationsByCityWithSavedStats,
    getPopularLocations,
    updateLocationDescription,
    addLocation,
    updateLocation,
};
