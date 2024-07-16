const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const shelterModel = require("../models/shelterModel");
const animalModel = require("../models/animalModel");

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
const shelterLogin = async (req, res) => {
  try {
    const { email, pswd } = req.body;

    //Buscamos usuario por mail
    const shelter = await shelterModel.findOne({ email: email });

    if (!shelter) {
      return res.status(401).json({
        error: "email o contraseña incorrecta",
      });
    }

    //Revisamos si la contraseña es la que tenemos registrada
    const validatePswd = await bcrypt.compare(pswd, shelter.pswd); // R:true||false
    if (!validatePswd) {
      return res.status(401).json({
        error: "email o contraseña incorrecta",
      });
    }

    //Si entra en esta línea todo correcto => Incrustamos Token con datos del usuario en el payload
    const token = generateToken(
      {
        shelterId: shelter._id,
        email: shelter.email,
        userType: "shelter",
        name: shelter.name,
      },
      false //No es un token de refresco
    );

    const refreshToken = generateToken(
      {
        shelterId: shelter._id,
        email: shelter.email,
        userType: "shelter",
        name: shelter.name,
      },
      true //Es un token de refresco
    );

    res.status(200).json({
      status: "succeeded",
      data: {
        id: shelter._id,
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

const modifyShelter = async (req, res) => {
  try {
    const idByMail = req.user.email; //El middle crea "req.user" aunque sea un shelter
    let shelter = await shelterModel.findOne({ email: idByMail });

    if (!shelter) {
      return res.status(404).json({
        status: "failed",
        message:
          "Protectora no encontrada, por favor, vuelva a ingresar usuario y contraseña",
      });
    }

    const newShelterData = req.body;

    // Contemplamos en especial si se indica un password, necesita hashearse.
    if (newShelterData.pswd) {
      shelter.pswd = await bcrypt.hash(newShelterData.pswd, 10);
      //AÑADIR MAIL SERVICE CUANDO SE PUEDA <---------------------------------------------- !!!!!!            !!!!  !!!!
    }

    // Actualizará el resto de campos de shelter, solo si se proporcionan en el body como newShelterData
    shelter.email = newShelterData.email || shelter.email;
    shelter.name = newShelterData.name || shelter.name;
    shelter.province = newShelterData.province || shelter.province;
    shelter.locality = newShelterData.locality || shelter.locality;
    shelter.phone = newShelterData.phone || shelter.phone;
    shelter.address = newShelterData.address || shelter.address;
    shelter.web = newShelterData.web || shelter.web;
    shelter.socialMedia = newShelterData.socialMedia || shelter.socialMedia;

    await shelter.save(); // Guarda los cambios en la base de datos

    console.log(shelter);
    const time = timeStamp();
    console.log(
      `${time} Protectora ${newShelter.name} Modificada correctamente`
    );
    res.status(201).json({
      status: "success",
      message: "Datos de protectora modificados correctamente",
      error: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      error: "Error al modificar los datos de la protectora",
      message: error.message,
    });
  }
};

const deleteShelter = async (req, res) => {
  try {
    const shelterId = req.user.shelterId;
    const shelterData = await shelterModel.findById(shelterId);

    if (shelterData) {
      await shelterModel.findByIdAndDelete(shelterId);
      res.status(200).json({
        status: "success",
        message: "Datos de protectora eliminados satisfactoriamente",
        error: null,
      });
      const time = timeStamp();
      console.log(
        `${time} Protectora ${shelterData.name} eliminada correctamente`
      );
    } else {
      res.status(404).json({
        status: "failed",
        message: "No localizada la protectora",
        error: "Protectora no localizada",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      error: "Error al eliminar la protectora",
      message: error.message,
    });
  }
};

module.exports = { signUpShelter, shelterLogin, modifyShelter, deleteShelter };
