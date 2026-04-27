require("dotenv").config();
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

async function importReviews() {
    const jsonPath = path.join(__dirname, "../data/reviews.json");
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(rawData);
    
    const reviewsArray = Array.isArray(data) ? data : [data];

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        for (const review of reviewsArray) {
            await conn.query(
                `INSERT INTO reviews (review_id, user_id, location_id, rating, comment, like_count, created_at, is_visible, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    review.review_id,
                    review.user_id,
                    review.location_id,
                    review.rating,
                    review.comment || null,
                    review.like_count || 0,
                    review.created_at,
                    review.is_visible || true,
                    review.deleted_at || null,
                ]
            );
        }

        await conn.commit();
        console.log(`✓ Successfully imported ${reviewsArray.length} reviews`);
        process.exit(0);
    } catch (err) {
        await conn.rollback();
        console.error("✗ Import failed:", err.message);
        process.exit(1);
    } finally {
        conn.release();
    }
}

importReviews();
