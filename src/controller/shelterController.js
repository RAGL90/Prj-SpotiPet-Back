const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const shelterModel = require("../models/shelterModel");
const animalModel = require("../models/animalModel");
const requestModel = require("../models/requestModel");

const bcrypt = require("bcrypt");
const generateToken = require("../core/middleware/auth/auth");

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
const shelterAnimal = async (req, res) => {
  try {
    const shelterId = req.user.shelterId;

    if (!shelterId) {
      return res.status(404).json({
        status: "failed",
        message: "Sin autorización, por favor, inicie sesión",
      });
    }

    const shelterData = await shelterModel.findById(shelterId);
    if (!shelterData) {
      return res.status(404).json({
        status: "failed",
        message:
          "Protectora o Asociación no encontrada, no se puede entregar mensajes",
      });
    }
    let shelterAnimals = [];

    for (let animals of shelterData.animals) {
      let animalFound = await animalModel.findById(animals);
      if (animalFound) {
        shelterAnimals.push(animalFound);
      }
    }

    if (shelterAnimals.length === 0) {
      return res.status(200).json({
        status: "succeeded",
        message: "Sin animales que mostrar",
        data: [],
      });
    }
    return res.status(200).json({
      status: "succeded",
      data: shelterAnimals,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido obtener datos de animal",
      error: error.message,
    });
  }
};
//-----------> CREAR ANIMAL
const createAnimal = async (req, res, next) => {
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
      cost,
      urgent,
    } = req.body;

    const photo = []; //Primero se genera la ficha, luego se subirán las imágenes para tener previamente el ID del animal => carpeta donde ubicar photos
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

    //Extraemos datos del creador del animal con el payload
    const { shelterId, email, userType, name: ownerName } = req.user;

    //Creamos esta variable por necesidad del modelo de datos, recien registrado no tiene ningun adoptante
    const adopted = false;

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
      adopted,
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

    //No hay fotos => pasamos respuesta al cliente.
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
    // 2º CONTEMPLAMOS QUE ANIMAL EXISTE.
    if (!animal) {
      return res.status(404).json({
        status: "failed",
        message:
          "Animal no localizado por favor, revise si la ID proporcionada es correcta",
        error: "Animal no localizado",
      });
    }
    //3º Comprobamos que sea propietario del animal, si no, no se puede realizar esta acción.
    if (shelterId !== animal.owner.ownerId) {
      return res.status(404).json({
        status: "failed",
        message: "El usuario difiere del propietario del animal",
        error: "No se pudo borrar el animal",
      });
    }

    if (animal.status === "adopted") {
      //Procedemos al borrado del animal.
      await animalModel.findByIdAndDelete(animalId);
      //NO ACCEDEMOS A SOLICITUDES:
      //Si está adoptado, la solicitud está aceptada para un usuario y todas las "pending" pasa a ser rechazadas con causa

      //Informamos en consola
      const time = timeStamp();
      console.log(
        `${time} - ${animalId} - ${animal.name} eliminado del registro por parte de la protectora con ID: ${shelterId}`
      );

      //Indicamos respuesta HTTP - Los datos guardados del animal están en el área de solicitudes que tiene los datos necesarios
      return res.status(202).json({
        status: "success",
        message:
          "Animal adoptado eliminado correctamente, se reservan algunos datos por derecho de informacion del usuario adoptante",
        error: null,
      });
    }
    //El animal no estaba adoptado, hay que informar si tenía solicitantes
    const requests = await requestModel.find({
      reqAnimalId: animalId,
      status: "pending",
    });
    if (requests) {
      //Habían solicitantes:
      //Procedemos a enviar su email informativo usando "For of" (de ES6) => Recorremos el array extraido en mongoose:
      for (const request of requests) {
        //Generamos asunto:
        const messageSubject = `Spot My Pet 🐾 - Actualización sobre tu solicitud de adopción de ${animal.name}`;
        //Promesa (porque el envío de email puede fallar)
        try {
          //Generamos mensaje con la plantilla de deleted
          const message = await userInfoDeletedPet(
            request.applicantName,
            animal.name
          );

          //Llamamos a nodemailer - Enviando asunto y plantilla
          await emailService.sendEmail(
            request.applicantEmail,
            messageSubject,
            message
          );
        } catch (error) {
          //Capturamos posible error:
          console.error(
            `Error al enviar email a ${request.applicantEmail}: ${error}`
          );
        }
      }
    }

    //3. Actualizamos todos los requests de pending a refused, con una declaración automatizada
    await requestModel.updateMany(
      { reqAnimalId: animalId, status: "pending" }, //Filtro de busqueda
      {
        $set: {
          status: "refused",
          refusedDescr:
            "Animal eliminado de la plataforma por el propietario ¡Lamentamos las molestias!",
        },
      } //Accion para cada encuentro
    );

    //Borrado del animal en el array de la protectora.
    await shelterModel.findByIdAndUpdate(shelterId, {
      $pull: { animals: animalId },
    });

    //Indicamos respuesta HTTP
    return res.status(202).json({
      status: "success",
      message: "Animal eliminado correctamente",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "No se ha podido borrar el animal",
      error: error.message,
    });
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

//Obtener Info de los datos de Shelter
const getShelter = async (req, res) => {
  try {
    // 1º Revisamos que traiga el token de verify
    if (!req.user) {
      return res.status(401).json({
        status: "failed",
        message: "Inicie sesión para acceder al usuario",
      });
    }
    const { shelterId, email, userType, name } = req.user;

    if (!shelterId) {
      return res.status(401).json({
        status: "failed",
        message: "No está autorizado para ver el perfil",
      });
    }

    let shelter = await shelterModel.findById(
      shelterId,
      //Eliminamos datos sensibles y de funcion interna del objeto shelter (HAY QUE AÑADIR AL MODELO -pswdCode -registerDate -deletedDate)
      "-pswd"
    );

    if (!shelter) {
      /*
      Recordamos que si el usuario esta clasificado como "deletedUser" implica está eliminado
      Pero no se han borrados sus datos por motivos de seguridad para evitar abusos:
        · Alcanzar el limite de mascotas creadas y que todas sean adoptadas
            Borrar y crear nuevo perfil.
      
        No obstante se hace un borrado de la mayoría de datos y se clasifica como deletedUser
      
      Si el usuario intenta loguear tras ordenar su borrado, le daremos indicación de que no existe.
      (Pero no podrá crearse otro perfil)
      */
      return res.status(404).json({
        status: "failed",
        message:
          "La protectora indicada no existe, o no se encuentra disponible, contactar con administración de la plataforma",
      });
    }
    res.status(200).json({
      status: "succeeded",
      data: shelter,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      data: null,
      error: error.message,
    });
  }
};

module.exports = {
  signUpShelter,
  shelterLogin,
  getShelter,
  modifyShelter,
  deleteShelter,
  shelterAnimal,
  createAnimal,
  deleteAnimal,
  modifyAnimal,
};
