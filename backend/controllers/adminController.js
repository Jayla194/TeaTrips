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

module.exports = {
    getDashboardStats
}