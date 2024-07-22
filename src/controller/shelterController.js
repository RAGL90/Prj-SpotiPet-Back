const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const shelterModel = require("../models/shelterModel");
const animalModel = require("../models/animalModel");

const bcrypt = require("bcrypt");
const generateToken = require("../core/auth/middleware/auth");

//Importación email Service:
const newPetRegister = require("../core/services/messages/newPetRegisterShelter");
const emailService = require("../core/services/emailService");

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

// -------------------------------------MANIPULACION DEL MODELO ANIMALES --------------------------------------------------

//-----------> CREAR ANIMAL
const createAnimal = async (req, res) => {
  try {
    //Variables del animal rellena el creador => req.body
    //Otra variables se crearán heredadas por el payload

    const {
      specie,
      size,
      name,
      gender,
      hairType,
      numberID,
      breed,
      birthDate,
      physicFeatures,
      mainColor,
      description,
      photo,
      urgent,
      cost,
    } = req.body;
    //                                  Renombramos name del payload para evitar conflictos con name del animal que se va a crear

    if (!req.user) {
      res.status(403).json({
        status: "failed",
        message:
          "Es necesario estar registrado y logueado para crear una mascota",
        error: "Imposible procesar la solicitud",
      });
      return;
    }

    //Creamos la variable para formatear la fecha en formato UTC y que tenga scope a toda la función
    let birthDateFormated = null;

    if (birthDate) {
      //El usuario introduce la fecha en formato ES, ej => 31/12/2024
      const day = birthDate.substring(0, 2);
      const month = birthDate.substring(3, 5);
      const year = birthDate.substring(6);

      //Le restamos 1 al mes porque empieza en 0
      birthDateFormated = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    }

    //Extraemos datos del creador con el payload
    const { shelterId, email, userType, name: ownerName } = req.user;

    //Creamos esta variable para el modelo, recien registrado no tiene ningun adoptante
    const adopter = "";

    //Si el animal es un Perro es NECESARIO indicar el tamaño.
    if (specie === "Perros" && !size) {
      console.log(
        "Se anula registro de animal - Motivo es Perro y no se indica tamaño"
      );
      return res.status(412).json({
        status: "failed",
        message: "Es necesario indicar un tamaño al crear un perro",
        error: "Tamaño no especificado, es necesario para registrar al perro",
      });
    }
    const registerDate = new Date();

    //Finalmente creamos el nuevo animal
    const newAnimal = new animalModel({
      registerDate,
      specie,
      size,
      name,
      gender,
      hairType,
      numberID,
      breed,
      birthDate: birthDateFormated,
      physicFeatures,
      mainColor,
      description,
      cost,
      photo,
      urgent,
      owner: {
        ownerId: shelterId,
        ownerType: userType,
        ownerName,
      },
      adopter,
    });

    //Guardamos nuestra mascota
    await newAnimal.save();
    //Informamos del cambio en la BBDD
    const time = timeStamp();
    console.log(
      `${time} Nueva mascota: ${newAnimal.name} , tipo ${newAnimal.specie} - Creado correctamente`
    );

    //Modificamos la ficha de la protectora para que vea en su panel el nuevo animal registrado
    let shelter = await shelterModel.findById(shelterId);
    shelter.animals.push(newAnimal._id);
    await shelter.save();

    //Pasamos respuesta al cliente.
    res.status(200).json({
      status: "success",
      message: `La mascota ${newAnimal.name} está creada correctamente`,
      error: null,
    });

    //Llamamos al Mail Service - Situamos el código aquí porque puede ser más lento que la respuesta
    let icon = "";
    switch (newAnimal.specie) {
      case "Perros":
        icon = "🐶";
        break;
      case "Gatos":
        icon = "🐱";
        break;
      case "Roedores":
        icon = "🐹🐰";
        break;
      case "Aves":
        icon = "🦜";
        break;

      default:
        icon = "🐾";
        break;
    }
    const messageSubject = `Spot My Pet 🐾 - ¡${newAnimal.name} ${icon} está listo para ser adoptado 👏!`;
    const message = await newPetRegister(newAnimal.name, newAnimal.specie);
    await emailService.sendEmail(shelter.email, messageSubject, message);
    //Finaliza el registro
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido registrar a la mascota",
      error: error.message,
    });
  }
};

//-----------> ELIMINAR ANIMAL
const deleteAnimal = async (req, res) => {
  try {
    const { animalId } = req.body;
    if (!req.user) {
      res.status(403).json({
        status: "failed",
        message: "Es necesario estar registrado y logueado para esta acción",
        error: "Imposible procesar la solicitud",
      });
      return;
    }
    // 1º EXTRAEMOS DATOS DEL PAYLOAD.
    const { shelterId, email, userType, name } = req.user;
    const animal = await animalModel.findById(animalId);
    // 2º CONTEMPLAMOS QUE ANIMAL NO EXISTE.
    if (!animal) {
      res.status(404).json({
        status: "failed",
        message:
          "Animal no localizado por favor, revise si la ID proporcionada es correcta",
        error: "Animal no localizado",
      });
      return;
    } else {
      //3º Comprobamos que el ownerID y el Payload sean el mismo, si no, no se puede realizar esta acción.
      if (shelterId === animal.owner.ownerId) {
        //Procedemos al borrado del animal
        await animalModel.findByIdAndDelete(animalId);
        //Informamos en consola
        const time = timeStamp();
        console.log(
          `${time} - ${animalId} - ${animalModel.name} eliminado del registro`
        );
        //Borrado del animal en el array de la protectora.
        await shelterModel.findByIdAndUpdate(shelterId, {
          $pull: { animals: animalId },
        });
        //Indicamos respuesta HTTP
        res.status(202).json({
          status: "success",
          message: "Animal eliminado correctamente",
          error: null,
        });
        return;
      }
      res.status(404).json({
        status: "failed",
        message: "El usuario difiere del propietario del animal",
        error: "No se pudo borrar el animal",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido borrar el animal",
      error: error.message,
    });
    return;
  }
};

// MODIFICAR ANIMAL
const modifyAnimal = async (req, res) => {
  try {
    //1º Observar si hay login:
    if (!req.user) {
      res.status(403).json({
        status: "failed",
        message: "Es necesario estar registrado y logueado para esta acción",
        error: "Imposible procesar la solicitud",
      });
      return;
    }
    //2º Extraemos datos de la solicitud
    const newAnimalData = req.body;
    const { shelterId, email, userType, name } = req.user;

    //3º Observar si no hay datos de ID
    if (!newAnimalData.id) {
      res.status(400).json({
        status: "failed",
        message: "Id del animal no proporcionado",
        error: "No se pudo procesar los cambios, ID no proporcionada",
      });
      return;
    }
    //4º Procesamos búsqueda del animal
    let animal = await animalModel.findById(newAnimalData.id);
    console.log("Datos del shelter:" + shelterId);
    console.log("Datos del ownerAnimal:" + animal.owner.ownerId);
    if (shelterId === animal.owner.ownerId) {
      //Analizamos los datos obtenidos
      animal.status = newAnimalData.status || animal.status;
      animal.specie = newAnimalData.specie || animal.specie;
      animal.size = newAnimalData.size || animal.size;
      animal.name = newAnimalData.name || animal.name;
      animal.hairType = newAnimalData.hairType || animal.hairType;
      animal.numberID = newAnimalData.numberID || animal.numberID;
      animal.breed = newAnimalData.breed || animal.breed;
      animal.birthDate = newAnimalData.birthDate || animal.birthDate;
      animal.physicFeatures =
        newAnimalData.physicFeatures || animal.physicFeatures;
      animal.gender = newAnimalData.gender || animal.gender;
      animal.mainColor = newAnimalData.mainColor || animal.mainColor;
      animal.description = newAnimalData.description || animal.description;
      animal.urgent = newAnimalData.urgent || animal.urgent;

      await animal.save(); // Guardamos cambios
      const time = timeStamp();
      console.log(
        `${time} - ${animal.id} - Se ha modificado los datos ${animal.name}`
      );

      res.status(202).json({
        status: "Success",
        message: "Se ha modificado los datos correctamente",
        animal,
        error: null,
      });
      return;
    } else {
      res.status(404).json({
        status: "failed",
        message: "El usuario difiere del propietario del animal",
        error: "No se pudo modificar el animal",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido borrar el animal",
      error: error.message,
    });
    return;
  }
};

module.exports = {
  signUpShelter,
  shelterLogin,
  modifyShelter,
  deleteShelter,
  createAnimal,
  deleteAnimal,
  modifyAnimal,
};
