const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "campusfix",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
