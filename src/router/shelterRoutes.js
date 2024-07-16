const express = require("express");
const router = express.Router();

//Carga del Middleware
const { verifyToken } = require("../core/auth/middleware/middle");

//Controllers
const {
  signUpShelter,
  shelterLogin,
} = require("../controller/shelterController");

//Rutas por orden de accion:
router.post("/signup", signUpShelter);
router.post("/login", shelterLogin);

module.exports = router;
