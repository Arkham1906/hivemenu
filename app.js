const express = require("express");
const path = require("path");
const app = express();
const vendedorRoutes = require("./routes/vendedores");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use("/vendedores", vendedorRoutes);

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
