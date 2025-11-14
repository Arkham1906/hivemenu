const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host : "localhost",
    user : "root",
    password : "190906",
    database : "hive"
});

module.exports = db;
