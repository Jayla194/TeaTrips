const reviewModel = require('../models/reviewModel');
const jwt = require("jsonwebtoken");

function getUserIdFromToken(req) {
    const token = req.cookies?.tt_token;
    if (!token) return null;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return payload?.user_id || null;
    } catch {
        return null;
    }
}

// GET /api/reviews/location/:locationId?sort=recent|liked|highest|lowest
async function getByLocation(req, res) {
    const locationId = Number(req.params.locationId);
    if (!Number.isInteger(locationId)) {
        return res.status(400).json({ error: 'Invalid location ID' });
    }

    const sort = (req.query.sort || 'recent').toLowerCase();
    const sortMap = {
        recent: "r.created_at DESC",
        liked: "r.like_count DESC",
        highest: "r.rating DESC",
        lowest: "r.rating ASC"
    };

    const orderBy = sortMap[sort] || sortMap.recent;

    try {
        const userId = getUserIdFromToken(req);
        const rows = await reviewModel.getByLocation(locationId, orderBy, userId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
}

// GET /api/reviews/user
async function getByUser(req, res) {
    const userId = req.user.user_id;
    try {
        const rows = await reviewModel.getByUser(userId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user reviews' });
    }
}

// POST /api/reviews/location/:locationId
async function create(req, res) {
    const userId = req.user.user_id;
    const locationId = Number(req.params.locationId);
    let { comment, rating } = req.body;

    if (!Number.isInteger(locationId)){
        return res.status(400).json({ error: 'Invalid location ID' });
    }
    if (comment !== undefined && comment !== null) {
        if (typeof comment !== 'string') {
            return res.status(400).json({ error: 'Comment must be a string' });
        }
        if (comment.length > 1000) {
            return res.status(400).json({ error: 'Comment must be up to 1000 characters' });
        }
        if (comment.trim() === "") {
            comment = null;
        }
    } else {
        comment = null;
    }
    const ratingNum = Number(rating);
    const isHalfStep = Number.isFinite(ratingNum) && Math.round(ratingNum * 2) / 2 === ratingNum;
    if (!isHalfStep || ratingNum < 0.5 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating must be between 0.5 and 5 in 0.5 steps' });
    }

    try {
        const result = await reviewModel.createReview({
            user_id: userId,
            location_id: locationId,
            comment,
            rating: ratingNum
        });
        res.status(201).json({ review_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating review' });
    }
}


// PUT /api/reviews/:reviewId
async function update(req, res) {
    const userId = req.user.user_id;
    const reviewId = Number(req.params.reviewId);
    let { comment, rating } = req.body;
    
    if (!Number.isInteger(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID' });
    }

    try {
        const existing = await reviewModel.getReviewById(reviewId);
        if (!existing || existing.is_visible === false) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (existing.user_id !== userId) {
            return res.status(403).json({ error: 'Not allowed to update review' });
        }

        const updateData = {};
        if (comment !== undefined) {
            if (comment !== null && typeof comment !== 'string') {
                return res.status(400).json({ error: 'Comment must be a string' });
            }
            if (typeof comment === 'string' && comment.length > 1000) {
                return res.status(400).json({ error: 'Comment must be up to 1000 characters' });
            }
            updateData.comment = typeof comment === 'string' && comment.trim() === "" ? null : comment;
        }
        if (rating !== undefined) {
            const ratingNum = Number(rating);
            const isHalfStep = Number.isFinite(ratingNum) && Math.round(ratingNum * 2) / 2 === ratingNum;
            if (!isHalfStep || ratingNum < 0.5 || ratingNum > 5) {
                return res.status(400).json({ error: 'Rating must be between 0.5 and 5 in 0.5 steps' });
            }
            updateData.rating = ratingNum;
        }
        
        await reviewModel.updateReview(reviewId, updateData);
        return res.json({ message: 'Review updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating review' });
    }
}

// DELETE /api/reviews/:reviewId (author delete)
async function remove(req, res) {
    const userId = req.user.user_id;
    const reviewId = Number(req.params.reviewId);
    
    if (!Number.isInteger(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID' });
    }
    try {
        const existing = await reviewModel.getReviewById(reviewId);
        if (!existing || existing.is_visible === false) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (existing.user_id !== userId) {
            return res.status(403).json({ error: 'Not allowed to delete review' });
        }
        await reviewModel.deleteReview(reviewId);
        return res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting review' });
    }
}

// POST /api/reviews/:reviewId/like
async function like(req, res) {
    const userId = req.user.user_id;
    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID' });
    }

    try {
        const existing = await reviewModel.getReviewById(reviewId);
        if (!existing || existing.is_visible === false) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (existing.user_id === userId) {
            return res.status(403).json({ error: 'Cannot like your own review' });
        }
        const result = await reviewModel.addLike(reviewId, userId);
        const row = await reviewModel.getReviewById(reviewId);
        return res.json({ liked: result.liked, like_count: row?.like_count ?? 0 });
    } catch (error) {
        return res.status(500).json({ error: 'Error liking review' });
    }
}

// DELETE /api/reviews/:reviewId/like
async function unlike(req, res) {
    const userId = req.user.user_id;
    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId)) {
        return res.status(400).json({ error: 'Invalid review ID' });
    }
    try {
        const existing = await reviewModel.getReviewById(reviewId);
        if (!existing || existing.is_visible === false) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (existing.user_id === userId) {
            return res.status(403).json({ error: 'Cannot like your own review' });
        }
        const result = await reviewModel.removeLike(reviewId, userId);
        const row = await reviewModel.getReviewById(reviewId);
        return res.json({ liked: result.liked, like_count: row?.like_count ?? 0 });
    } catch (error) {
        return res.status(500).json({ error: 'Error unliking review' });
    }
}

// GET /api/admin/reviews
async function getAllReviews(req, res) {
    try {
        const visibility = String(req.query.visibility || "visible").toLowerCase();
        const normalizedVisibility = visibility === "hidden" ? "hidden" : "visible";
        const rows = await reviewModel.getAllReviews(normalizedVisibility);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reviews" });
    }
}

module.exports = {
    getByLocation,
    getByUser,
    create,
    update,
    remove,
    like,
    unlike,
    getAllReviews,
};
