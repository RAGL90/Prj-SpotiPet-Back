//IMPORTACIONES:
//  Modelos de datos
const userModel = require("../models/userModels");
const animalModel = require("../models/animalModel");
const requestModel = require("../models/requestModel");
//  Utilidades para acciones de usuario
const generateToken = require("../core/middleware/auth/auth");
const NIFverifier = require("../core/utils/NIFverifier");
const timeStamp = require("../core/utils/timeStamp");
const bcrypt = require("bcrypt");
//  Servicio de Email:
const emailService = require("../core/services/emailService");
const userRegisterMail = require("../core/services/messages/signedUpUser");
const newPetRegisterU = require("../core/services/messages/newPetRegisterUser");
const userInfoDeletedPet = require("../core/services/messages/userInfoDeletedPet");

//-----------------------------------------REGISTRO DE USUARIO
const signup = async (req, res) => {
  try {
    const {
      email,
      pswd,
      userType,
      name,
      lastname,
      tipoNIF,
      NIF,
      birthDate,
      province,
      locality,
      address,
      phone,
    } = req.body;

    let birth = null;

    if (birthDate) {
      //El usuario introduce la fecha en formato ES, ej => 31/12/2024
      const day = birthDate.substring(0, 2);
      const month = birthDate.substring(3, 5);
      const year = birthDate.substring(6);

      //Le restamos 1 al mes porque empieza en 0
      birth = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    }

    const registerDate = new Date();

    const newUser = new userModel({
      registerDate,
      email,
      pswd: await bcrypt.hash(pswd, 10),
      userType,
      tipoNIF,
      NIF,
      name,
      birth,
      lastname,
      province,
      locality,
      address,
      phone,
    });

    let NIFfacilitado = false;

    if (tipoNIF === "DNI" || tipoNIF === "NIE") {
      NIFfacilitado = true;

      //Creamos un objeto con la función NIFVerifier en Utils => Si es válido "control.valid será true"
      const control = NIFverifier(tipoNIF, NIF);

      if (!control.valid) {
        //Si el objeto control indica un error, se le pasará una respuesta presentando como error la causa de invalidación
        return res.status(400).json({
          status: "failed",
          message: control.invalidCause,
        });
      } else {
        await newUser.save();

        //Declaración de parámetros Nodemailer
        const messageSubject = `¡Gracias por registrarte en Spot My Pet ${newUser.username}! 🐾`;
        //Como llamamos a una función y estamos en un async DEBEMOS incluir await
        const message = await userRegisterMail(newUser.name);

        //Envío del mensaje
        await emailService.sendEmail(newUser.email, messageSubject, message);

        const time = timeStamp();
        console.log(
          `${time} Usuario ${newUser.email} registrado correctamente`
        );

        return res.status(201).json({
          status: "succeed",
          message: "Usuario creado correctamente",
          newUser,
        });
      }
    }

    if (NIFfacilitado === false) {
      //El usuario ha preferido no dar su NIF, se procede con el registro
      await newUser.save();

      //Parámetros Nodemailer
      const messageSubject = `¡Gracias por registrarte en Spot My Pet ${newUser.username}! 🐾`;
      //Llamamos a la función de la plantilla de email para que se adapte
      const message = await userRegisterMail(newUser.username);
      //Envío del mensaje
      await emailService.sendEmail(newUser.email, messageSubject, message);

      //Creación del log
      const time = timeStamp();
      console.log(
        `${time} Usuario ${newUser.email} registrado correctamente (sin NIF)`
      );

      res.status(201).json({
        status: "succeed",
        message:
          "Usuario creado correctamente, Advertencia: Sin proporcionar todos los datos no puedes adoptar",
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

//-----------------------------------------OBTENCIÓN DE USUARIOS PARA ADMIN
//falta añadir control admin

// const getUser = async (req, res) => {
//   try {
//     const users = await userModel.find();
//     res.status(200).json({
//       status: "success",
//       users,
//       error: null,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "failed",
//       users: null,
//       error: error.message,
//     });
//   }
// };

//----------------------------------------- LOGUEO Y VERIFICACION DE USUARIO
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
        name: user.username, //Puede no tener name
      },
      false //Es un token de refresco
    );

    const refreshToken = generateToken(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        name: user.username, //Puede no tener name
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
 - Tipo de usuario
 - Nombre de usuario.
*/

//----------------------------------------- MODIFICAR DATOS DE USUARIO
const modifyUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(402).json({
        status: "failed",
        message: "Inicie sesión para realizar los cambios",
      });
    }

    const { userId, email, userType, name } = req.user;

    let user = await userModel.findById(userId);

    if (!user) {
      //No sabría como ha llegado hasta aquí, dado que va con Payload
      return res.status(404).json({
        status: "failed",
        message:
          "Usuario no encontrado, por favor, vuelva a ingresar usuario y contraseña",
      });
    }

    const newUserData = req.body;
    if (newUserData.NIF && newUserData.tipoNIF) {
      const control = NIFverifier(tipoNIF, newUserData.NIF);
      if (!control.valid) {
        //Si el objeto control indica un error, se le pasará una respuesta presentando como error la causa de invalidación
        return res.status(400).json({
          status: "failed",
          message: control.invalidCause,
        });
      }
    }
    //ACTUALIZAMOS user.birth SOLO SI ES INDICADO, PARA ELLO LO FORMATEAMOS UTC
    if (newUserData.birth) {
      // 0123456789
      //El usuario introduce la fecha en formato ES, ej => 31/12/2024
      const day = newUserData.birth.substring(0, 2);
      const month = newUserData.birth.substring(3, 5);
      const year = newUserData.birth.substring(6, 10);

      //Le restamos 1 al mes porque en formato UTC empieza en 0 los meses
      const birthFormatted = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      user.birth = birthFormatted;
      console.log(user.birth);
    }

    // Actualiza los campos solo si se proporcionan en newUserData
    user.email = newUserData.email || user.email;
    user.name = newUserData.name || user.name;
    user.lastname = newUserData.lastname || user.lastname;
    user.age = newUserData.age || user.age;
    user.province = newUserData.province || user.province;
    user.locality = newUserData.locality || user.locality;
    user.address = newUserData.address || user.address;
    user.phone = newUserData.phone || user.phone;

    if (
      newUserData.userType ||
      newUserData.animalLimit ||
      newUserData.animalsCreated
    ) {
      //Si trata de modificar el tipo de usuario, su limite de adopciones, o la cantidad en adopción
      return res.status(401).json({
        status: "failed",
        message: "Petición no autorizada",
      });
    }
    await user.save(); // Guarda los cambios en la base de datos

    console.log(
      `Se han guardado los siguientes datos del usuario: ${user.email}`
    );

    return res.status(201).json({
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

//----------------------------------------- ELIMINACION DEL USUARIO
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        status: "failed",
        message: "Usuario no encontrado, inicie sesion por favor",
      });
    }

    /* En caso de que el usuario haya adoptado/creado algún animal se guardarán datos mínimos
    para evitar fraudes o intentos de evitar la medida de control del limite del animal.
    
    Legalmente se conoce en RGPD se conoce como interés legítimo estos datos que se guardarán
    son el NIF y el email, pasado un tiempo prudente se hará un borrado del usuario.
    */

    //Borrado de solicitudes rechazadas o pendientes - Las aceptadas se mantienen por seguridad!
    await requestModel.deleteMany({
      applicantId: userId,
      status: { $in: ["pending", "refused"] },
    });

    if (userData.animalLimit != 0 || userData.createAnimal != 0) {
      //Si uno de estos parámetros está alterado, el usuario ha creado o adoptado un animal

      userData.pswd = "userDeleted-000";
      userData.username = "Usuario eliminado";
      userData.lastname = null;
      userData.birth = new Date();
      userData.province = null;
      userData.locality = null;
      userData.address = null;
      userData.phone = null;
      userData.userType = "deletedUser";
      userData.deletedDate = new Date();

      const time = timeStamp();
      console.log(
        `${time} usuario con ID: ${userId} eliminado con reservas de informacion-!!!`
      );

      await userData.save();

      return res.status(200).json({
        status: "success",
        message: `Gran parte de los datos de usuario eliminados.
          Debido a su actividad en la plataforma se han reservado datos mínimos para garantizar la seguridad de los animales
          * Los datos que se han mantenido son: Email, NIF y solicitudes de adopciones aceptadas.
          
          Garantizamos que el email no será utilizado para ningún tipo de contacto.

          Pasado un tiempo prudencial serán eliminados los datos
          `,
        error: null,
      });
    } else {
      //En caso de que no haya ningun animal subido, boraremos inmediatamente sus datos:
      await userModel.findByIdAndDelete(userId);

      const time = timeStamp();
      console.log(
        `${time} usuario ${userData.username} eliminado correctamente`
      );

      return res.status(200).json({
        status: "success",
        message: "Datos de usuario eliminados satisfactoriamente",
        error: null,
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

// -------------------------------------MANIPULACION DEL MODELO ANIMALES --------------------------------------------------

//-----------------------------------------> CREAR ANIMAL
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
      //Los usuarios no podrán indicar costes, ni urgencia estos dos parámetros son exclusivos para Protectoras
    } = req.body;
    const photo = []; //Primero se genera la ficha, luego se subirán las imágenes para tener previamente ID del animal.

    //Creamos esta variable para el modelo, recien registrado no tiene ningun adoptante
    const adopted = false;
    //Los usuarios siempre serán con urgent en modo false.
    const urgent = false;

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

    // Extraemos datos del usuario que crea el animal con el payload
    // Renombramos name del payload para evitar conflictos con name del animal que se va a crear
    const { userId, email, userType, name: ownerName } = req.user;

    //Buscamos la ficha del usuario y la guardamos:
    let user = await userModel.findById(userId);

    //Si el animal es un Perro es NECESARIO indicar el tamaño.
    if (specie === "Perros" && !size) {
      return res.status(412).json({
        status: "failed",
        message: "Es necesario indicar un tamaño al crear un perro",
        error: "Tamaño no especificado, es necesario para registrar al perro",
      });
    }

    //Generamos la fecha de creación:
    const registerDate = new Date();

    //CREACION de ANIMAL
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
      location: user.province,
      photo,
      urgent,
      owner: {
        ownerId: userId,
        ownerType: userType,
        ownerName: user.name,
      },
      adopted,
    });

    if (user.animalsCreated.length < 3) {
      await newAnimal.save();
      user.animalsCreated.push(newAnimal._id);
      //Guardamos la mascota en la ficha del usuario como array

      await user.save();
      //Informamos del cambio en la BBDD a la consola:
      const time = timeStamp();
      console.log(
        `${time} Nueva mascota: ${newAnimal.name} , tipo ${newAnimal.specie} - Creado correctamente`
      );

      //Pasamos respuesta al cliente. Sin return => Continuar con los servicios de emailing
      res.status(200).json({
        status: "success",
        message: `La mascota ${newAnimal.name} está creada correctamente`,
        animalId: newAnimal._id,
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
      const message = await newPetRegisterU(
        newAnimal.name,
        newAnimal.specie,
        user.animalLimit.length
      );

      await emailService.sendEmail(user.email, messageSubject, message);
      //Finaliza el registro
      return;
    } else {
      res.status(403).json({
        status: "failed",
        message: "No puedes subir más de 3 animales",
        error: "User animal creation restrincted",
      });

      const time = timeStamp();
      console.log(
        `${time} El usuario ${user.name} con email: ${user.email} ha superado el límite de subida de animales`
      );
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido registrar a la mascota",
      error: error.message,
    });
  }
};

//----------------------------------------------------> ELIMINAR ANIMAL
const deleteAnimal = async (req, res) => {
  try {
    const { animalId } = req.body;

    if (!req.user) {
      return res.status(403).json({
        status: "failed",
        message: "Es necesario estar registrado y logueado para esta acción",
        error: "Imposible procesar la solicitud",
      });
    }

    //Extraemos datos del payload
    const { userId, email, userType, name } = req.user;

    //Buscamos animal por el ID
    const animal = await animalModel.findById(animalId);

    //Verificamos que el animal existe
    if (!animal) {
      return res.status(404).json({
        status: "failed",
        message:
          "Animal no localizado por favor, revise si la ID proporcionada es correcta",
        error: "Animal no localizado",
      });
    }

    //Verificamos que sea el propietario del animal
    if (userId !== animal.owner.ownerId) {
      return res.status(403).json({
        status: "failed",
        message: "El usuario difiere del propietario del animal",
        error: "No se pudo borrar el animal",
      });
    }

    //Revisamos si el animal ha sido adoptado:
    if (animal.status === "available") {
      //Tenemos que rechazar todas las solicitudes pendientes indicando el motivo a los usuarios vía email.
      //1.1 Recogemos las solicitudes en "pending"
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
          //Usamos try para generar promesa (porque el envío de email puede fallar)
          try {
            //Generamos mensaje con la plantilla para informar al usuario de una mascota eliminada
            const message = await userInfoDeletedPet(
              request.applicantName,
              animal.name
            );

            //Llamamos a nodemailer - Enviando asunto y plantilla generada
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

      //2º Modificamos las solicitudes de todos aquellos que tenían a este animal en pending:
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

      await animalModel.findByIdAndDelete(animalId);

      //Informamos en consola
      const time = timeStamp();
      console.log(
        `${time} - ${animalId} - ${animal.name} eliminado del registro`
      );

      //Actualización del límite del animal => https://www.mongodb.com/docs/manual/reference/operator/update/pull/
      await userModel.findByIdAndUpdate(userId, {
        $pull: { animalsCreated: animalId }, //Extraemos el ID del animal del array
      });

      //Indicamos respuesta HTTP
      return res.status(202).json({
        status: "success",
        message: "Animal eliminado correctamente",
        error: null,
      });
    } else {
      //En este caso el animal estaba adoptado

      // Eliminaremos el animal, pero NO se reduce el animalLimit
      await animalModel.findByIdAndDelete(animalId);

      //Informamos en consola
      const time = timeStamp();
      console.log(
        `${time} - ${user.email} elimina el registro del animal: ${animalId} - SIN actualizacion de límite`
      );

      const user = await userModel.findById(userId);
      const counter = 3 - user.createAnimal.length;
      //Indicamos respuesta HTTP
      return res.status(202).json({
        status: "success",
        message: `Animal eliminado de la plataforma correctamente.
        Su límite temporal de creacion de animales en la plataforma es de ${counter}`,
        error: null,
      });
    }
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
    const { userId, email, userType, name } = req.user;

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

    if (userId === animal.owner.ownerId) {
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

      return res.status(202).json({
        status: "Success",
        message: "Se ha modificado los datos correctamente",
        animal,
        error: null,
      });
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
      message: "No se ha podido modificar el animal",
      error: error.message,
    });
    return;
  }
};

const userAnimals = async (req, res) => {
  try {
    const { userId, email, userType, name } = req.user;

    if (!userId) {
      return res.status(404).json({
        status: "failed",
        message: "Sin autorización, por favor inicie sesión",
      });
    }

    const user = await userModel.findById(userId);

    if (!userId) {
      return res.status(404).json({
        status: "failed",
        message: "Usuario no localizado",
      });
    }

    //Creamos array userAnimals para recoger los datos de animales de cada usuario
    let userAnimals = [];

    for (let animals of user.animalsCreated) {
      //Introducimos todos los datos de cada animal encontrado.
      let animalFound = await animalModel.findById(animals);
      userAnimals.push(animalFound);
    }

    if (userAnimals.length === 0) {
      //Si el array del usuario está vacío, es correcto no daremos un error pero si un mensaje
      return res.status(200).json({
        status: "succeeded",
        data: "Sin animales que mostrar",
      });
    }
    return res.status(200).json({
      status: "succeeded",
      data: userAnimals,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se ha podido leer los datos del animal",
      error: error.message,
    });
  }
};

//getUser - A la espera
module.exports = {
  signup,
  login,
  modifyUser,
  deleteUser,
  userAnimals,
  createAnimal,
  modifyAnimal,
  deleteAnimal,
};
