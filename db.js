const database = require("mime-db");
const mysql = require("myysql2/promise");
const { hostname } = require("os");

const db = mysql.createPool({
    host : "localhost",
    user : "host",
    password : "190906", //Aqui debe de ir la contrasena que usaron en mysql, es la de ustedes no la mia
    database : "hive"
});

export default db;