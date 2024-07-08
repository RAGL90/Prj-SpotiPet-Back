const shelterModel = require("../models/shelterModel");

const bcrypt = require("bcrypt");

//REGISTRO DE PROTECTORA
const signUpShelter = async (req, res) => {
  try {
    const {
      tipoNIF,
      NIF,
      nombre,
      provincia,
      localidad,
      direccion,
      telefono,
      email,
      password,
    } = req.body;

    Shelter = new shelterModel({
      tipoNIF,
      NIF,
      nombre,
      provincia,
      localidad,
      direccion,
      telefono,
      email,
      pswd: await bcrypt.hash(pswd, 10),
    });
  } catch (error) {}
};
