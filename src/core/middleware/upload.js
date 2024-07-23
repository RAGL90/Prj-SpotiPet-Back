const multer = require("multer");
const path = require("path");
const fs = require("fs");

//Datos de configuracion de Multer

//Validacion de archivos por tipo y tamaño:
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true); // Aceptar archivo
  } else {
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    );
  }
};

const limits = {
  fileSize: 6 * 1024 * 1024, //Está en bytes así que para 5MB => 5 * 1024 (hasta aqui serían KB) * 1024 (aquí MB)
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(
      __dirname,
      "..",
      "animals",
      "uploads",
      req.animalId
    );
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    const index = req.files.indexOf(file);
    const newFileName = req.animalFilenames[index];
    cb(null, newFileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});
module.exports = upload;
