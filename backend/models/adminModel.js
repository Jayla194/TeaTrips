const db = require("../config/db");

// Get all totals
async function getTotalUsers() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM users");
    return rows[0].total;
}

async function getTotalLocations() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM locations");
    return rows[0].total;
}

async function getTotalReviews() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM reviews");
    return rows[0].total;
}

// Last 7 days totals
async function getWeeklyNewUsers() {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS total FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );
    return rows[0].total;
}

async function getWeeklyReviews(){
    const [rows] = await db.query(
        "SELECT COUNT(*) AS total FROM reviews WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );
    return rows[0].total;
}

// Admin: Get all locations with saved/review stats
async function getAllLocationsAdmin() {
    const [rows] = await db.query(
        `
        SELECT
            loc.*,
            COALESCE(saved_stats.saved_count, 0) AS saved_count,
            COALESCE(review_stats.review_count, 0) AS review_count
        FROM locations loc
        LEFT JOIN (
            SELECT location_id, COUNT(*) AS saved_count
            FROM saved_locations
            GROUP BY location_id
        ) AS saved_stats ON saved_stats.location_id = loc.id
        LEFT JOIN (
            SELECT location_id, COUNT(*) AS review_count
            FROM reviews
            GROUP BY location_id
        ) AS review_stats ON review_stats.location_id = loc.id
        ORDER BY loc.name ASC
        `
    );

    return rows;
}

// Admin: Get all visible reviews with related user/location context
async function getAllReviewsAdmin() {
    const [rows] = await db.query(
        `
        SELECT
            r.review_id,
            r.user_id,
            r.location_id,
            r.rating,
            r.comment,
            r.like_count,
            r.created_at,
            u.first_name,
            u.last_name,
            l.name AS location_name
        FROM reviews r
        JOIN users u ON u.user_id = r.user_id
        JOIN locations l ON l.id = r.location_id
        WHERE r.is_visible = TRUE
        ORDER BY r.created_at DESC
        `
    );

    return rows;
}

// Admin: Get users ordered by newest account first
async function getAllUsersAdmin() {
    const [rows] = await db.query(
        `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
        `
    );

    return rows;
}


module.exports = {
    getTotalUsers,
    getTotalLocations,
    getTotalReviews,
    getWeeklyNewUsers,
    getWeeklyReviews,
    getAllLocationsAdmin,
    getAllReviewsAdmin,
    getAllUsersAdmin,
};

