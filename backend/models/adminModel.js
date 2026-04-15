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


module.exports = {
    getTotalUsers,
    getTotalLocations,
    getTotalReviews,
    getWeeklyNewUsers,
    getWeeklyReviews

}