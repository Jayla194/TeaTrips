const db = require("../config/db");

async function findUserIdByEmail(email) {
    const [rows] = await db.query(
        "SELECT user_id FROM users WHERE email = ?",
        [email]
    );
    return rows;
}

async function createUser({ first_name, last_name, email, password_hash, role = "user" }) {
    const [result] = await db.query(
        "INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?,?,?,?,?)",
        [first_name, last_name, email, password_hash, role]
    );
    return result;
}

async function findUserByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
}

async function findUserById(userId) {
    const [rows] = await db.query(
        "SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = ?",
        [userId]
    );
    return rows[0];
}

module.exports = {
    findUserIdByEmail,
    createUser,
    findUserByEmail,
    findUserById,
};
