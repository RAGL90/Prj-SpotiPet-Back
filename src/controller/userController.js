const user = require("../models/userModels");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { email, pswd, userType, username, lastname } = req.body;

    const newUser = new user({
      email,
      pswd: await bcrypt.hash(pswd, 10),
      userType,
      username,
      lastname,
    });

    await newUser.save();

    res.status(201).json({
      status: "succeed",
      message: "Usuario creado correctamente",
      newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se pudo crear el nuevo usuario",
      error: error.message,
    });
  }
};

module.exports = { signup };
