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

//Creamos la funcion de multer con carga y tipo de carga (simple o múltimple)
//En el paréntesis indicamos el nombre que debe indicar la solicitud en este caso "image" será el nombre aceptado en el envío de archivos.
const upload = multer({ storage }).single("image");

router.post("/:animalId", verifyToken, async (req, res, next) => {
  //Indicamos en URL el ID del animal
  try {
    const animalId = req.params.animalId; //Conservamos ese ID que nos será util para validaciones
    if (!animalId) {
      //1ª Validacion - No se ha indicado ningun ID => RECHAZAMOS
      return res.status(400).json({
        status: "failed",
        message: "Se requiere de un Id de animal para subir el archivo",
        error: "Not ID Found",
      });
    }
    //2ª Validacion - Se ha indicado un ID => BUSCAMOS
    let animal = await animalModel.findById(animalId);
    if (!animal) {
      //2.1 - No se localiza
      return res.status(400).json({
        status: "failed",
        message: "El Id del animal indicado no existe",
        error: "Not ID Found",
      });
    }
    //2.2 - Se localiza el animal => 3º Extraemos datos del Payload
    const { shelterId, userId, email, userType, name: ownerName } = req.user;

    //3.1 - No se obtienen identificadores de Usuario => Rechazamos la peticion con un Forbiden
    if (!shelterId && !userId) {
      return res.status(403).json({
        status: "Forbiden",
        message: "Es necesario estar logueado para esta acción",
        error: "Ingrese sesion e intentelo de nuevo",
      });
    }
    //3.2 - Se obtiene Identificador
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
