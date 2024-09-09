const express = require("express");
const router = express.Router();
const { verifyToken } = require("../core/middleware/auth/middle");

const {
  signup,
  getUser,
  login,
  modifyUser,
  deleteUser,
  userAnimals,
  createAnimal,
  modifyAnimal,
  deleteAnimal,
} = require("../controller/userController");

const {
  createRequest,
  getContract,
  getRequests,
  choiceRequest,
  userReadRequest,
} = require("../controller/requestController");

// router.get("/", getUser);
//Zona de rutas para usuarios sin registros ni autenticación
router.post("/signup", signup);
router.post("/login", login);

//Zona de rutas perfil usuario:
router.get("/user-panel", verifyToken, getUser);
router.patch("/user-panel", verifyToken, modifyUser);
router.delete("/user-panel", verifyToken, deleteUser);

//Zona de rutas para animales subidos:
router.get("/animal", verifyToken, userAnimals);
router.post("/animal", verifyToken, createAnimal);
router.patch("/animal", verifyToken, modifyAnimal);
router.delete("/animal", verifyToken, deleteAnimal);

//Zona de rutas para solicitudes:
//Lectura de TODAS las solicitudes recibidas
router.get("/requests", verifyToken, getRequests);
//Lectura de una solicitud en concreto recibida
router.get("/request/", verifyToken, userReadRequest);
//Conseguir contrato adopción
router.get("/request/:requestId", verifyToken, getContract);
//Crear y enviar una solicitud
router.post("/request/:animalId", verifyToken, createRequest);
//Decidir una solicitud recibida
router.patch("/request/:requestId", verifyToken, choiceRequest);

module.exports = router;
