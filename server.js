console.log("Cargando server.js..."); //Mensaje para cpmprobar que el servidor esta cargando

const app = require('./app'); //esta constante manda a llamar al archivo app.js

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000'); //genera el servidor de manera local
});
