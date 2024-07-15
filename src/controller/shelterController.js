const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const shelterModel = require("../models/shelterModel");

const bcrypt = require("bcrypt");
const generateToken = require("../core/auth/middleware/auth");

//REGISTRO DE PROTECTORA
const signUpShelter = async (req, res) => {
  try {
    const {
      tipoNIF,
      NIF,
      name,
      province,
      locality,
      address,
      phone,
      email,
      pswd,
      web,
      socialMedia,
    } = req.body;

    //Declaramos variables para el sistema
    const tipoAsociacion = "";
    const uncommon = false; //uncommon => Registros que en su CIF - NO son asociaciones
    const animals = []; //En el registro la protectora no tiene animales aún.

    const newShelter = new shelterModel({
      tipoNIF,
      NIF,
      name,
      province,
      locality,
      address,
      phone,
      email,
      pswd: await bcrypt.hash(pswd, 10),
      animals,
      tipoAsociacion,
      uncommon,
      web,
      socialMedia,
    });

    const control = NIFverifier(tipoNIF, NIF);

    if (!control.valid) {
      res.status(400).json({
        status: "failed",
        message: control.invalidCause,
      });
    }

    if (control.valid) {
      newShelter.uncommon = control.raro;
      newShelter.tipoAsociacion = control.tipoAsociacion;

      await newShelter.save();

      const time = timeStamp();
      console.log(
        `${time} Protectora ${newShelter.name} registrada correctamente`
      );

      res.status(201).json({
        status: "Success",
        message: "Protectora guardada correctamente",
        newShelter,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "No se pudo crear la nueva protectora",
      error: error.message,
    });
  }
};

//LOGUEO Y VERIFICACION DE PROTECTORAS
const login = async (req, res) => {
  try {
    const { email, pswd } = req.body;

    //Buscamos usuario por mail
    const shelter = await shelterModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        error: "email o contraseña incorrecta",
      });
    }

    //Revisamos si la contraseña es la que tenemos registrada
    const validatePswd = await bcrypt.compare(pswd, shelter.pswd); //R: true/false
    if (!validatePswd) {
      return res.status(401).json({
        error: "email o contraseña incorrecta",
      });
    }

    //Si entra en esta línea todo correcto => Incrustamos Token con datos del usuario en el payload
    const token = generateToken(
      {
        shelterId: shelter.id,
        email: shelter.email,
        userType: "shelter",
        name: shelter.name,
      },
      false //No es un token de refresco
    );

    const refreshToken = generateToken(
      {
        shelterId: shelter.id,
        email: shelter.email,
        userType: "shelter",
        name: shelter.name,
      },
      true //Es un token de refresco
    );

    res.status(200).json({
      status: "succeeded",
      data: {
        id: shelter.id,
        email: shelter.email,
        userType: "shelter",
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

module.exports = { signUpShelter, login };
