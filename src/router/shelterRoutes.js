//Carga básica de Express y su funcion Router
const express = require("express");
const router = express.Router();

//Carga del Middleware de verificación
const { verifyToken } = require("../core/middleware/auth/middle");

//Controllers
const {
  signUpShelter,
  shelterLogin,
  getShelter,
  modifyShelter,
  deleteShelter,
  createAnimal,
  deleteAnimal,
  modifyAnimal,
} = require("../controller/shelterController");

const {
  getRequests,
  choiceRequest,
  getContract,
} = require("../controller/requestController");

//Area sin verificación, crear usuario y login:
router.post("/signup", signUpShelter);
router.post("/login", shelterLogin);

//Creacion del animal (Las fotos tienen su propio routes que será llamado tras la creacion de ficha así podemos crear un ID)
router.post("/animal", verifyToken, createAnimal);

//Modificaciones y eliminaciones del animal - TAREA: Falta solventar solicitudes en caso de delete del ANIMAL
router.delete("/animal", verifyToken, deleteAnimal);
router.patch("/animal", verifyToken, modifyAnimal);

//CONSULTA y MODIFICACION de SOLICITUDES:
router.get("/requests", verifyToken, getRequests);
router.get("/request/:requestId", verifyToken, getContract);
router.patch("/request/:requestId", verifyToken, choiceRequest);

//Modificaciones y eliminaciones del Shelter - TAREA: Falta solventar solicitudes en caso de delete de la protectora.
router.get("/panel", verifyToken, getShelter);
router.patch("/panel/:id", verifyToken, modifyShelter);
router.delete("/panel/:id", verifyToken, deleteShelter);

module.exports = router;
