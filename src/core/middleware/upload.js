const multer = require("multer");
const path = require("path");
const fs = require("fs");

// const storage = multer.diskStorage({
//   destination: path.join(
//     __dirname,
//     `../../../public/animals/upload/${animalId}`
//   ),

//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({
//   storage,
//   dest: path.join(__dirname, `../../../public/animals/upload/${animalId}`),
//   limits: { fileSize: 3 * 1024 * 1024 },
// }).single("image"); //Nombre del archivo HTML que debe tener el cliente al enviarlo

/*
//Datos de configuracion de Multer
const folderName = (text, length) => {
  
}
//1. Validacion de archivos por tipo y tamaño:
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
//2. Limitación por tamaño del archivo:
const limits = {
  fileSize: 6 * 1024 * 1024, //Está en bytes así que para 5MB => 5 * 1024 (hasta aqui serían KB) * 1024 (aquí MB)
};

//3. Guardado de datos:
//Destino y nombrado de archivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(
      __dirname,
      "..",
      "animals",
      "uploads",
      req.params
    );
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    const index = req.files.indexOf(file);
    const newFileName = req.params[index];
    cb(null, newFileName);
  },
});

//Finalmente exportamos funcion con las condiciones guardadas
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});
*/
// module.exports = upload;
