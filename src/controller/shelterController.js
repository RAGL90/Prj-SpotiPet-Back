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
    if (!control) {
      res.status(400).json({
        status: "failed",
        message: "NIF no válido, inténtelo de nuevo",
      });
    }
    if (tipoNIF === "CIF") {
      newShelter.raro = control.raro;
      newShelter.tipoAsociacion = control.tipoAsociacion;
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

module.exports = { signUpShelter };
