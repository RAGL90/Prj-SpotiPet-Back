const generateToken = require("../core/auth/middleware/auth");
const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const userModel = require("../models/userModels");
const bcrypt = require("bcrypt");
const emailService = require("../core/services/emailService");
const userRegisterMail = require("../core/services/messages/signedUpUser");

//REGISTRO DE USUARIO
const signup = async (req, res) => {
  try {
    const {
      email,
      pswd,
      userType,
      username,
      lastname,
      animalLimit,
      tipoNIF,
      NIF,
      province,
      locality,
      address,
      age,
      phone,
    } = req.body;

    const animals = [];

    const newUser = new userModel({
      email,
      pswd: await bcrypt.hash(pswd, 10),
      userType,
      username,
      lastname,
      tipoNIF,
      NIF,
      province,
      locality,
      address,
      age,
      phone,
      animalLimit,
      animals,
    });

    let NIFfacilitado = false;

    if (tipoNIF === "DNI" || tipoNIF === "NIE") {
      NIFfacilitado = true;

      const control = NIFverifier(tipoNIF, NIF);

      if (!control.valid) {
        res.status(400).json({
          status: "failed",
          message: control.invalidCause,
        });
      } else {
        await newUser.save();

        //Declaración de parámetros Nodemailer
        const messageSubject = `¡Gracias por registrarte en Spot My Pet ${newUser.username}! 🐾`;
        //Como llamamos a una función y estamos en un async DEBEMOS incluir await
        const message = await userRegisterMail(newUser.username);

        //Envío del mensaje
        await emailService.sendEmail(newUser.email, messageSubject, message);

        const time = timeStamp();
        console.log(
          `${time} Usuario ${newUser.email} registrado correctamente`
        );

        res.status(201).json({
          status: "succeed",
          message: "Usuario creado correctamente",
          newUser,
        });
      }
    }

    if (NIFfacilitado === false) {
      //El usuario ha preferido no dar su NIF, se procede con el registro
      await newUser.save();
      const time = timeStamp();
      console.log(
        `${time} Usuario ${newUser.email} registrado correctamente (sin NIF)`
      );
      res.status(201).json({
        status: "succeed",
        message: "Usuario creado correctamente",
        newUser,
      });
    }
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
        userId: user._id,
        email: user.email,
        userType: user.userType,
        name: user.name, //Puede no tener name
      },
      false //Es un token de refresco
    );

    const refreshToken = generateToken(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        name: user.name, //Puede no tener name
      },
      true //Es un token de refresco
    );

    res.status(200).json({
      status: "succeeded",
      data: {
        id: user._id,
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

const modifyUser = async (req, res) => {
  try {
    const idByMail = req.user.email;
    let user = await userModel.findOne({ email: idByMail });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message:
          "Usuario no encontrado, por favor, vuelva a ingresar usuario y contraseña",
      });
    }

    const newUserData = req.body;

    // Actualiza los campos solo si se proporcionan en newUserData
    user.email = newUserData.email || user.email;
    user.username = newUserData.username || user.username;
    user.lastname = newUserData.lastname || user.lastname;
    user.age = newUserData.age || user.age;
    user.province = newUserData.province || user.province;
    user.locality = newUserData.locality || user.locality;
    user.address = newUserData.address || user.address;
    user.phone = newUserData.phone || user.phone;

    if (newUserData.userType || newUserData.animalLimit) {
      return res.status(401).json({
        status: "failed",
        message: "Petición no autorizada",
      });
    }

    await user.save(); // Guarda los cambios en la base de datos
    console.log(`Se han guardado los siguientes datos:
      Email de usuario: ${user.email}
      Nombre de usuario: ${user.username}
      Apellidos de usuario: ${user.lastname}
      Edad del usuario: ${user.age}
    `);

    res.status(201).json({
      status: "success",
      message: "Datos del usuario modificados correctamente",
      error: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      error: "Error al modificar los datos del usuario",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findById(userId);

    if (userData) {
      await userModel.findByIdAndDelete(userId);
      res.status(200).json({
        status: "success",
        message: "Datos de usuario eliminados satisfactoriamente",
        error: null,
      });
      const time = timeStamp();
      console.log(
        `${time} usuario ${userData.username} eliminado correctamente`
      );
    } else {
      res.status(404).json({
        status: "failed",
        message: "No localizado la usuario",
        error: "usuario no localizado",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      error: "Error al eliminar usuario",
      message: error.message,
    });
  }
};

module.exports = { signup, login, getUser, modifyUser, deleteUser };
