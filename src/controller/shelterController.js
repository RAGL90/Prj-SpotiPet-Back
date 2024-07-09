const NIFverifier = require("../core/utils/NIFverifier");
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
      pswd,
    } = req.body;
    const tipoAsociacion = "";
    const raro = false;

    const newShelter = new shelterModel({
      tipoNIF,
      NIF,
      nombre,
      provincia,
      localidad,
      direccion,
      telefono,
      email,
      pswd: await bcrypt.hash(pswd, 10),
      tipoAsociacion,
      raro,
    });

    const control = NIFverifier(tipoNIF, NIF);

    console.log(`Se ha revisado el CIF es:
      Tipo de asociación: ${control.tipoAsociacion}
      Es raro? ${control.raro}`);

    if (!control.valid) {
      res.status(400).json({
        status: "failed",
        message: control.invalid,
      });
    }
    newShelter.raro = control.raro;
    newShelter.tipoAsociacion = control.tipoAsociacion;

    await newShelter.save();

    res.status(201).json({
      status: "Success",
      message: "Protectora guardada correctamente",
      newShelter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "No se pudo crear la nueva protectora",
      error: error.message,
    });
  }
};

module.exports = { signUpShelter };
