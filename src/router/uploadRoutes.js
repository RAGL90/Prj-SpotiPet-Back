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
//Carga de UUID para incrustar nombres únicos a los archivos:
const { v4: uuidv4 } = require("uuid");

//Carga de Modelos de datos
const animalModel = require("../models/animalModel");

//Carga de utilidad para consola
const timeStamp = require("../core/utils/timeStamp");
const { version } = require("os");

// Usamos un objeto con CONFIGURACION de Multer - El destino cambia según el req.params       ******** CONFIG
const storage = multer.diskStorage({
  //Guardamos en disco (No en memoria)
  destination: function (req, file, cb) {
    const animalId = req.params.animalId;
    //Obtenemos el animalId por la url que indica el cliente/usuario
    const uploadPath = path.join(
      __dirname,
      `../public/animals/uploads/${animalId}`
      //Indicamos lugar dónde queremos que se creen las imágenes
    );

    if (!fs.existsSync(uploadPath)) {
      //En caso de que no exista la carpeta => Usamos File System para crearla
      fs.mkdirSync(uploadPath, { recursive: true });
      //Recursive activado es para crear carpetas que no existan
    }
    //Si CallBack está null, pasamos la ruta de carga de archivos
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
    //Si callback está null, generamos un nombre unico, y mantenemos la extension de su nombre original
  },
});

//Creamos la FUNCION de multer usando la configuracion de Storage.
//En el parámetro final tipo de carga (.simple o  múltiple)
//En el paréntesis del tipo de carga indicamos el nombre ha de tener LA SOLICITUD, en este caso "image".
const upload = multer({
  storage,
  limits: {
    fileSize: 6 * 1000 * 1000, //6MB como limite de peso - el valor se indica en Bytes
  },
  fileFilter: (req, file, cb) => {
    const fileAccepted = /jpeg|jpg|png|gif|tif|svg|webp/;
    const mimetype = fileAccepted.test(file.mimetype); // Es un test (true o false) MimeType indica la extension del archivo, ej: mimetype: "image/jpeg"
    /*
    La biblioteca Path tiene incorporada funciones utiles:
    - extname -> extrae la extensión del archivo, si indicamos file.originalname lo extrae del nombre original del cliente
    */
    const extname = fileAccepted.test(path.extname(file.originalname));
    if (mimetype && extname) {
      //Si ambos son true se verifica que el archivo es una imagen y pasamos un callback limpio para que proceda
      return cb(null, true);
    }

    cb("Error: El archivo no es un formato de imagen válido");
  },
}).single("image");

//WRAPPER para capturar errores de Multer:
function uploadMiddleware(req, res, next) {
  upload(req, res, function (error) {
    if (error) {
      // Si Multer en su biblioteca genera un error, se procede a enviar el error.
      if (error instanceof multer.MulterError) {
        // Errores específicos de Multer (ej: 'file too large')
        return res.status(500).json({
          status: "failed",
          message: "Error al cargar el archivo",
          error: error.message,
        });
      } else {
        // Si el error es por nuestra configuracion con mensaje personalizados como fileFilter enviamos el error al cliente.
        return res.status(400).json({
          status: "failed",
          message: "Error al cargar el archivo",
          error: error,
        });
      }
    }
    // Si no hay errores, continua con el siguiente middleware
    next();
  });
}

router.post("/:animalId", verifyToken, async (req, res) => {
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
    //3.2 - Se obtiene Identificador => 4ª Validación

    //4.1 - La peticion pertenece al propietario => OK, pasamos a multer
    if (userId === animal.owner.ownerId || shelterId === animal.owner.ownerId) {
      // Usamos el nuevo middleware de carga
      uploadMiddleware(req, res, async function () {
        // Aquí colocamos el código que se ejecuta después de que el archivo se haya cargado exitosamente
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
      //4.2 - La peticion pertenece a un usuario que NO ES propietario del animal => Forbidden
      return res.status(403).json({
        status: "Forbiden",
        message: "No autorizado para subir archivos para este animal",
        error: "Unauthorized",
      });
    }
  } catch (error) {
    //Errores no controlados
    res.status(500).json({
      status: "failed",
      message: "Failed loading files",
      error: error.message,
    });
  }
});

module.exports = router;
