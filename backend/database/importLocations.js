require("dotenv").config();
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function importLocations() {
    const jsonPath = path.join(__dirname, "../data/locations.json");
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(rawData);
    
    const locationsArray = Array.isArray(data) ? data : [data];

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        for (const location of locationsArray) {
            await conn.query(
                `INSERT INTO locations (id, name, type, address, city, postcode, lat, lon, website, phone, opening_hours, price_tier, avg_rating, suggested_duration, tags, image_url, description_short, description_long, description_last_generated, review_count_at_generation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    location.id,
                    location.name,
                    location.type,
                    location.address,
                    location.city,
                    location.postcode,
                    location.lat,
                    location.lon,
                    location.website,
                    location.phone,
                    location.opening_hours,
                    location.price_tier,
                    location.avg_rating,
                    location.suggested_duration,
                    location.tags,
                    location.image_url,
                    location.description_short,
                    location.description_long,
                    null,
                    location.review_count_at_generation,
                ]
            );
        }

        await conn.commit();
        console.log(`✓ Successfully imported ${locationsArray.length} locations`);
        process.exit(0);
    } catch (err) {
        await conn.rollback();
        console.error("✗ Import failed:", err.message);
        process.exit(1);
    } finally {
        conn.release();
    }
}

importLocations();
