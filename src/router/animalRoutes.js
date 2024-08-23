const express = require("express");
const router = express.Router();
const { getAnimals, getAnimalId } = require("../controller/animalController");

router.get("/", getAnimals);
router.get("/animals/:animalId", getAnimalId);

module.exports = router;
