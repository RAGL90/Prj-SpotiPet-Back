//AREA DE CONFIGURACION
require("dotenv").config();

//DECLARACION DE LIBRERIAS
const express = require("express");
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");
const PORT = process.env.PORT || 9000;

//AREA ROUTERS
const userRouter = require("./router/userRoutes");
const shelterRouter = require("./router/shelterRoutes");
const animalRouter = require("./router/animalRoutes");
const uploadRoutes = require("./router/uploadRoutes");

//AREA SWAGGER

//ACTIVACION DE LIBRERIAS PRINCIPALES
const app = express();

app.use(express.json());

app.use(cors());

//CARGA DE RUTA B-DATOS
const url_mongo = process.env.DATABASE_URL;

//CONEXION BBDD
mongoose.connect(url_mongo);

//CASUISTICA DE CONEXION
const db = mongoose.connection;

db.on("error", (error) => {
  console.log("Connection problem! => " + error);
});

db.on("connected", () => {
  console.log("Connection stablished -- ok");
});

db.on("disconnected", () => {
  console.log("Warning! Disconnected from BBDD");
});

//AREA DE COMPORTAMIENTO

//CONTROLLERS
app.use("/user", userRouter);

app.use("/shelter", shelterRouter);

app.use("/", animalRouter);

app.use("/upload", uploadRoutes);

//STATIC FILES => Carpeta que será accesible desde el exterior de forma que el front lo recoja
app.use(express.static(path.join(__dirname, "public/animals/uploads/")));
//Ej de URL: http://localhost:9000/669f825ba35172da52428823/669f825ba35172da52428823.jpg

//SWAGGER

//NECESARIOS
app.use((req, res, next) => {
  res.status(404).send("Sorry, that path doesn't exist");
});

app.listen(PORT, () => {
  console.log(`Server ready and running at: http://localhost/${PORT}`);
});
