const express = require("express");
const router = express.Router();

const { signup } = require("../controller/userController");

router.post("/", signup);

module.exports = router;
