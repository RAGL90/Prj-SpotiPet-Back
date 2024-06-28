const express = require("express");
const router = express.Router();

const { signup, getUser, login } = require("../controller/userController");

router.get("/", getUser); // OK!
router.post("/signup", signup); // OK! /user/signup.
router.post("/login", login); // /user/login.

module.exports = router;
