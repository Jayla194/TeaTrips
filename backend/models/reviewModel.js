const pool = require('../config/db');

function getReviewsByLocation(locationId, orderBy, userId) {
    const sql = `
        SELECT r.review_id, r.user_id, r.location_id, r.rating, r.comment,
            r.like_count, r.created_at, u.first_name,
            IF(rl.user_id IS NULL, 0, 1) AS liked_by_me
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        LEFT JOIN review_likes rl
            ON rl.review_id = r.review_id AND rl.user_id = ?
        WHERE r.location_id = ? AND r.is_visible = TRUE
        ORDER BY ${orderBy}
    `;
    return pool.query(sql, [userId, locationId]).then(([rows]) => rows);
}

function createReview({ user_id, location_id, comment, rating }) {
    const sql = `
        INSERT INTO reviews (user_id, location_id, rating, comment, like_count, created_at, is_visible)
        VALUES (?, ?, ?, ?, 0, NOW(), TRUE)
    `;
    return pool.query(sql, [user_id, location_id, rating, comment]).then(([result]) => result);
}

function getReviewById(reviewId) {
    const sql = `
        SELECT review_id, user_id, location_id, rating, comment, like_count, created_at, is_visible
        FROM reviews
        WHERE review_id = ? AND is_visible = TRUE
    `;
    return pool.query(sql, [reviewId]).then(([rows]) => rows[0]);
}

function updateReview(reviewId, updatedFields) {
    const fields = [];
    const values = [];
    if (updatedFields.comment !== undefined) {
        fields.push('comment = ?');
        values.push(updatedFields.comment);
    }
    if (updatedFields.rating !== undefined) {
        fields.push('rating = ?');
        values.push(updatedFields.rating);
    }
    if (fields.length === 0) {
        return Promise.resolve();
    }
    values.push(reviewId);
    const sql = `
        UPDATE reviews
        SET ${fields.join(', ')}
        WHERE review_id = ? AND is_visible = TRUE
    `;
    return pool.query(sql, values).then(([result]) => result);
}

function deleteReview(reviewId) {
    const sql = `
        UPDATE reviews
        SET is_visible = FALSE, deleted_at = NOW()
        WHERE review_id = ?
    `;
    return pool.query(sql, [reviewId]).then(([result]) => result);
}

async function addLike(reviewId, userId) {
    const sql = `
        INSERT IGNORE INTO review_likes (review_id, user_id)
        VALUES (?, ?)
    `;
    const [insertResult] = await pool.query(sql, [reviewId, userId]);
    if (insertResult.affectedRows > 0) {
        await pool.query(
            `UPDATE reviews
             SET like_count = like_count + 1
             WHERE review_id = ? AND is_visible = TRUE`,
            [reviewId]
        );
        return { liked: true };
    }
    return { liked: true, alreadyLiked: true };
}

async function removeLike(reviewId, userId) {
    const sql = `
        DELETE FROM review_likes
        WHERE review_id = ? AND user_id = ?
    `;
    const [deleteResult] = await pool.query(sql, [reviewId, userId]);
    if (deleteResult.affectedRows > 0) {
        await pool.query(
            `UPDATE reviews
             SET like_count = GREATEST(like_count - 1, 0)
             WHERE review_id = ? AND is_visible = TRUE`,
            [reviewId]
        );
        return { liked: false };
    }
    return { liked: false, alreadyUnliked: true };
}

function getReviewsByUser(userId) {
    const sql = `
        SELECT r.review_id, r.user_id, r.location_id, r.rating, r.comment,
            r.like_count, r.created_at, u.first_name, l.name AS location_name,
            IF(rl.user_id IS NULL, 0, 1) AS liked_by_me
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        JOIN locations l ON r.location_id = l.id
        LEFT JOIN review_likes rl
            ON rl.review_id = r.review_id AND rl.user_id = ?
        WHERE r.user_id = ? AND r.is_visible = TRUE
        ORDER BY r.created_at DESC
    `;
    return pool.query(sql, [userId, userId]).then(([rows]) => rows);
}

module.exports = {
    getByLocation: getReviewsByLocation,
    createReview,
    getReviewById,
    updateReview,
    deleteReview,
    addLike,
    removeLike,
    getByUser: getReviewsByUser
};
