const express = require("express");
const router = express.Router();

//Carga del Middleware
const { verifyToken } = require("../core/auth/middleware/middle");

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
router.post("/animal", verifyToken, createAnimal);
router.delete("/animal", verifyToken, deleteAnimal);
router.patch("/animal", verifyToken, modifyAnimal);

router.patch("/panel/:id", verifyToken, modifyShelter);
router.delete("/panel/:id", verifyToken, deleteShelter);

module.exports = router;
