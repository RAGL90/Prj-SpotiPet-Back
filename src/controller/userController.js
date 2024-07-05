const generateToken = require("../core/auth/middleware/auth");
const userModel = require("../models/userModels");
const bcrypt = require("bcrypt");

//REGISTRO DE USUARIO
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

//OBTENCIÓN DE USUARIOS PARA ADMIN, falta añadir control admin
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

//LOGUEO Y VERIFICACION DE USUARIO
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
        userType: user.userType,
        name: user.name, //Puede no tener name
      },
      false //Es un token de refresco
    );

    const refreshToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
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

// ******* ACCIONES USUARIO LOGUEADO *********

/*
Contenido del Payload:
 - ID del usuario.
 - Email
 - User Name.
 */

const modifyMail = async (req, res) => {
  try {
    const userOldEmail = req.user.email;
    const user = await userModel.findOne({ email: userOldEmail });

    if (!req.body.email || typeof req.body.email !== "string") {
      return res.status(400).json({
        status: "failed",
        message: "Email no proporcionado o con formato no válido",
      });
    }

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message:
          "Datos de login no localizado, por favor, vuelva a ingresar usuario y contraseña",
      });
    }

    const newEmail = req.body;
    user.email = newEmail.email;
    console.log(user.email);
    await user.save();

    res.status(201).json({
      status: "success",
      message: "Email modificado correctamente",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Error al modificar el Email",
      message: error.message,
    });
  }
};

module.exports = { signup, login, getUser, modifyMail };
