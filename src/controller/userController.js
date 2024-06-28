const generateToken = require("../core/auth/middleware/auth");
const userModel = require("../models/userModels");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { email, pswd, userType, username, lastname, animalLimit } = req.body;

    const newUser = new userModel({
      email,
      pswd: await bcrypt.hash(pswd, 10),
      userType,
      username,
      lastname,
      animalLimit,
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

//Función panel de admins:
const getUser = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({
      status: "success",
      users,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      users: null,
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, pswd } = req.body;

    //Buscamos usuario por mail
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        error: "usuario o contraseña incorrecta",
      });
    }

    //Revisamos si la contraseña es la que tenemos registrada (user.pswd)
    const validatePswd = await bcrypt.compare(pswd, user.pswd); //R: true/false

    if (!validatePswd) {
      return res.status(401).json({
        error: "usuario o contraseña incorrecta",
      });
    }

    //Si entra en esta línea todo correcto => Incrustamos Token con datos del usuario en el payload
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name, //Puede no tener name
      },
      false //Es un token de refresco
    );

    const refreshToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name, //Puede no tener name
      },
      true //Es un token de refresco
    );

    res.status(200).json({
      status: "succeeded",
      data: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Error durante el login",
      message: error.message,
    });
  }
};

module.exports = { signup, login, getUser };
