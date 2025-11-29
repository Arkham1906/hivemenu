const mysql = require("mysql2/promise"); //solicita el modulo de mysql que tiene express
const fs = require("fs");

async function resetDatabase() { //crea la funcion resetDatabase la cual funciona para leer el archivo llamado dbhive.sql y ejecutarlo en mysql
    try {
        const connection = await mysql.createConnection({ //esta parte funciona para acceder a mysql ya q es la informacion que solicita al acceder
        host: "localhost",
        user: "root", 
        password: "190906",
        multipleStatements : true
        });

        const sql = fs.readFileSync("dbhive.sql", "utf8"); //es aqui donde se lee el archivo

        await connection.query(sql); //aqui hace la conexion a mysql

        console.log("Se reinicio correctamente la DB");
        await connection.end(); //cierra la conexion despues de que la ejecucion sea correcta 
    } catch (err) {
        console.error("Ubo un error al reiniciar la bd: ", err); //si llega a haber algun error, el catch lo atrapa y muestra el error
    }
}

resetDatabase();