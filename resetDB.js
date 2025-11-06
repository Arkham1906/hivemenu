const mysql = require("mysql2/promise");
const fs = require("fs");

async function resetDatabase() {
    try {
        const connection = await mysql.createConnection({
        host: "localhost",
        user: "root", 
        password: "190906",
        multipleStatements : true
        });

        const sql = fs.readFileSync("dbhive.sql", "utf8");

        await connection.query(sql);

        console.log("Se reinicio correctamente la fokin BD");
        await connection.end();
    } catch (err) {
        console.error("Ubo un error al reiniciar la bd: ", err);
    }
}

resetDatabase();
