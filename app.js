const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

console.log("Cargando rutas...");
const publicacionRoutes = require('./routes/publicacionRoutes');
app.use('/api/emprendimientos', publicacionRoutes);
console.log("Rutas cargadas correctamente");

module.exports = app;
