const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const shelterModel = require("../models/shelterModel");

const bcrypt = require("bcrypt");

//REGISTRO DE PROTECTORA
const signUpShelter = async (req, res) => {
  try {
    const {
      tipoNIF,
      NIF,
      name,
      province,
      locality,
      adress,
      phone,
      email,
      pswd,
      web,
      socialMedia,
    } = req.body;
    //Declaramos variables para el sistema
    const tipoAsociacion = "";
    const uncommon = false;
    //uncommon => Aquellos registros que no sean asociaciones en su CIF.

    const newShelter = new shelterModel({
      tipoNIF,
      NIF,
      name,
      province,
      locality,
      adress,
      phone,
      email,
      pswd: await bcrypt.hash(pswd, 10),
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

module.exports = { signUpShelter };
