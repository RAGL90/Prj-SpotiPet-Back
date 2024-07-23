const express = require("express");
const router = express.Router();

//Carga del Middleware
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

router.patch("/panel/:id", verifyToken, modifyShelter);
router.delete("/panel/:id", verifyToken, deleteShelter);

module.exports = router;
