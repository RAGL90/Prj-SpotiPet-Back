const express = require("express");
const router = express.Router();
const { verifyToken } = require("../core/middleware/auth/middle");

const {
  signup,
  getUser,
  login,
  modifyUser,
  deleteUser,
  createAnimal,
  modifyAnimal,
  deleteAnimal,
} = require("../controller/userController");
const { createRequest } = require("../controller/requestController");

//Zona de rutas para usuarios sin registros ni autenticación
router.get("/", getUser);
router.post("/signup", signup);
router.post("/login", login);

//Zona de rutas perfil usuario:
router.patch("/user-panel", verifyToken, modifyUser);
router.delete("/user-panel", verifyToken, deleteUser);

//Zona de rutas para animales subidos:
router.post("/animal", verifyToken, createAnimal);
router.patch("/animal", verifyToken, modifyAnimal);
router.delete("/animal", verifyToken, deleteAnimal);

//Zona de rutas para solicitudes:
router.post("/request/:animalId", verifyToken, createRequest);

module.exports = router;
