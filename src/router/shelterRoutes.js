const express = require("express");
const router = express.Router();
const { verifyToken } = require("../core/auth/middleware/middle");

const { signUpShelter } = require("../controller/shelterController");

router.post("/signup", signUpShelter);

module.exports = router;
