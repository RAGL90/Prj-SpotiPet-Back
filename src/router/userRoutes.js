const express = require("express");
const router = express.Router();
const { verifyToken } = require("../core/auth/middleware/middle");

const {
  signup,
  getUser,
  login,
  modifyUser,
} = require("../controller/userController");

router.get("/", getUser); // OK!
router.post("/signup", signup); // OK! /user/signup.
router.post("/login", login); //OK! /user/login.

router.patch("/user-panel", verifyToken, modifyUser);

module.exports = router;
