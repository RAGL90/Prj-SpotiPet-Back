//Carga básica de Express y su funcion Router
const express = require("express");
const router = express.Router();

//Carga del Middleware de verificación
const { verifyToken } = require("../core/middleware/auth/middle");

//Carga de Multer
const multer = require("multer");
//Carga de Path para manipular rutas de archivos
const path = require("path");
//Carga de fs (filesystem) para crear directorios en caso de no existir
const fs = require("fs");

//Carga de Modelos de datos
const animalModel = require("../models/animalModel");

//Carga de utilidad para consola
const timeStamp = require("../core/utils/timeStamp");

// Usamos una PRE CONFIGURACION de Multer
const storage = multer.diskStorage({
  //Guardamos en disco (No en memoria)
  destination: function (req, file, cb) {
    const animalId = req.params.animalId; //Obtenemos el animalId por el usuario
    const uploadPath = path.join(
      __dirname,
      `../public/animals/uploads/${animalId}` //Indicamos lugar dónde queremos que se creen las imágenes
    );

    if (!fs.existsSync(uploadPath)) {
      //En caso de que no exista la carpeta => Usamos File System para crearla
      fs.mkdirSync(uploadPath, { recursive: true }); //Recursive activado es para crear carpetas que no existan
    }

    cb(null, uploadPath); //Si CallBack está null, pasamos la ruta de carga de archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //Si callback está null, mantenemos los nombres de archivos originales
  },
});

const upload = multer({ storage }).single("image");

router.post("/:animalId", verifyToken, async (req, res, next) => {
  try {
    const animalId = req.params.animalId;
    if (!animalId) {
      res.status(400).json({
        status: "failed",
        message: "Se requiere de un Id de animal para subir el archivo",
        error: "Not ID Found",
      });
    }

    let animal = await animalModel.findById(animalId);
    const { shelterId, userId, email, userType, name: ownerName } = req.user;

    if (!shelterId && !userId) {
      //No disponemos de ningun registro del solicitante
      res.status(403).json({
        status: "Forbiden",
        message: "Es necesario estar logueado para esta acción",
        error: "Ingrese sesion e intentelo de nuevo",
      });
    }
    if (userId === animal.owner.ownerId || shelterId === animal.owner.ownerId) {
      upload(req, res, async function (err) {
        if (err) {
          return res.status(500).json({
            status: "failed",
            message: "Error al cargar el archivo",
            error: err.message,
          });
        }

        animal.photo.push(req.file.filename);
        await animal.save();

        const time = timeStamp();
        console.log(`${time} - ${animalId} - Foto cargada correctamente`);

        return res.status(200).json({
          status: "File Loaded",
          message: "Archivo subido con éxito",
          error: null,
        });
      });
    } else {
      return res.status(403).json({
        status: "Forbiden",
        message: "No autorizado para subir archivos para este animal",
        error: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Failed loading files",
      error: error.message,
    });
  }
});

module.exports = router;
