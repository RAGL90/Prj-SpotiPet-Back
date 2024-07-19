const express = require("express");
const router = express.Router();
const { verifyToken } = require("../core/auth/middleware/middle");

const {
  signup,
  getUser,
  login,
  modifyUser,
  deleteUser,
  createAnimal,
  modifyAnimal,
  deleteAnimal,
} = require("../controller/userController");

router.get("/", getUser);
router.post("/signup", signup);
router.post("/login", login);

router.post("/animal", verifyToken, createAnimal);
router.patch("/animal", verifyToken, modifyAnimal);
router.delete("/animal", verifyToken, deleteAnimal);

router.patch("/user-panel", verifyToken, modifyUser);
router.delete("/user-panel", verifyToken, deleteUser);

module.exports = router;
