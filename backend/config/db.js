const mysql = require("mysql2");

const dbPort = Number(process.env.DB_PORT || 3306);
const useSsl = String(process.env.DB_SSL || "").toLowerCase() === "true";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.getConnection((err, connection) =>{
    if(err){
        console.error("Database connection failed: ", err);
        return;
    } else{
        console.log("Connected to MySQL database");
        connection.release();
    }
});

module.exports = pool.promise();
