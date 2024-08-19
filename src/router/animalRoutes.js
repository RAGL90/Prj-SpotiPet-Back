const express = require("express");
const router = express.Router();
const { getAnimals } = require("../controller/animalController");

router.get("/", getAnimals);
router.get("/animals/:animalId");

module.exports = router;
