//Carga básica de Express y su funcion Router
const express = require("express");
const router = express.Router();

//Carga del Middleware de verificación
const { verifyToken } = require("../core/middleware/auth/middle");

const upload = require("../core/middleware/upload");

//Controllers
const {
  signUpShelter,
  shelterLogin,
  modifyShelter,
  deleteShelter,
  createAnimal,
  deleteAnimal,
  modifyAnimal,
} = require("../controller/shelterController");

router.post("/signup", signUpShelter);
router.post("/login", shelterLogin);

//Subida de imágenes del animal tras verificar el token => Procedemos a la aceptación de subida de fotos en array y creamos el animal

router.post("/animal", verifyToken, createAnimal);

router.delete("/animal", verifyToken, deleteAnimal);
router.patch("/animal", verifyToken, modifyAnimal);

//La carga de fotos es más compleja con multer por lo que lleva incorporado CONTROLLER:

// router.post(
//   "/:id/photos",
//   verifyToken,
//   upload.array("photos", 5),
//   async (req, res) => {
//     try {
//       if (!req.user) {
//         res.status(403).json({
//           status: "failed",
//           message: "Es necesario estar registrado y logueado para esta acción",
//           error: "Imposible procesar la solicitud",
//         });
//         return;
//       }
//       //2. Hay validacion de usuario se obtiene datos del usuario
//       const { shelterId, email, userType, name } = req.user;

//       //3. La id viene proporcionada en la url
//       const { id } = req.params;

//       //4. Hacemos carga del animal
//       let animal = await animalModel.findById(id);

//       //5. El animal indicado no existe
//       if (!animal) {
//         return res.status(404).json({
//           message: "Animal no localizado",
//         });
//       }

//       //6. Verificamos que el animal pertenece a la protecta
//       if (shelterId === animal.owner.ownerId) {
//         //Se procede con la carga de imágenes

//         // Los nombres de archivo ahora se generan correctamente en Multer
//         const photoNames = req.files.map((file) => file.filename);
//         animal.photos = [...animal.photos, ...photoNames]; // Suponiendo que 'photos' puede ser un array
//         await animal.save();

//         res
//           .status(200)
//           .json({ message: "Fotos subidas correctamente", photos: photoNames });
//       }
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Error al subir fotos", error: error.toString() });
//     }
//   }
// );

//

router.patch("/panel/:id", verifyToken, modifyShelter);
router.delete("/panel/:id", verifyToken, deleteShelter);

module.exports = router;
