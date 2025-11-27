const express = require('express'); //llama a express 
const path = require('path');
const cors = require('cors'); //llama al modulo cors el cual esta en los node_modules

const app = express();

//Middwelrs
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); //Aumenta el limite de mb para el parseo de json, se utiliza para guardar las imagenes

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //sirve a los archivos estaticos como son las imagenes, genera la carpeta uploads para subir las imagenes

//Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const publicacionRoutes = require('./routes/publicacionRoutes');  //establece las rutas por la cual seran renderizadas los controllers y models es lo mismo para todas las rutas
app.use('/api/emprendimientos', publicacionRoutes);

const vendedorRoutes = require('./routes/vendedorRoutes');
app.use('/api/vendedores', vendedorRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); //renderiza la vista principal
});

module.exports = app;