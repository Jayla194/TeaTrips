const adminModel = require("../models/adminModel");

async function getDashboardStats(req, res) {
    try {
        const totalUsers = await adminModel.getTotalUsers();
        const totalLocations = await adminModel.getTotalLocations();
        const totalReviews = await adminModel.getTotalReviews();
        const weeklyNewUsers = await adminModel.getWeeklyNewUsers();
        const weeklyReviews = await adminModel.getWeeklyReviews();

        res.json({
            summary: {
                totalUsers,
                totalLocations,
                totalReviews,
                newUsers7d: weeklyNewUsers,
                newReviews7d: weeklyReviews,
            }
        });
    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
}

async function getAllForAdmin(req, res) {
    try {
        const data = await adminModel.getAllLocationsAdmin();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}

async function getReviewsForAdmin(req, res) {
    try {
        const data = await adminModel.getAllReviewsAdmin();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}

async function getUsersForAdmin(req, res) {
    try {
        const data = await adminModel.getAllUsersAdmin();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}

module.exports = {
    getDashboardStats,
    getAllForAdmin,
    getReviewsForAdmin,
    getUsersForAdmin,
};