const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host : "localhost",
    user : "root",
    password : "¡Mololoa29!#",
    database : "hive"
});

module.exports = db;
