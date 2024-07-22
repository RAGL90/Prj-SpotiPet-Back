const express = require("express");
const router = express.Router();
const { getAnimals } = require("../controller/animalController");

router.get("/", getAnimals);

module.exports = router;
