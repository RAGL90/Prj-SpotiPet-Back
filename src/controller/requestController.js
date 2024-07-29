/*
Request funcionará de la siguiente forma:
 1. Solicitante indica en req.params (o URL) la ID del animal deseado.
 
 2. Con el Payload del login recogeremos datos del usuario.
    (Se verifican que todos sus datos necesarios estén indicados antes de proceder).
    - Chequeamos que el animal esté sin adoptar.

 3. Si están indicados sus datos, se procede a recoger datos del actual propietario del animal.

 4. Se transfieren TODOS los datos al request en status "pending".
 
 5. Elabora el documento PDF.

 6. Se envía email con PDF a la protectora y el solicitante.

 7. Respuesta al solicitante.

 8. La protectora ve las solicitudes, y aceptará cuando lo estime conveniente:
    - En caso de aceptar => Estado del animal => "Adopted", Estado de request = "accepted".
*/

const animalModel = require("../models/animalModel");
const userModel = require("../models/userModels");
const shelterModel = require("../models/shelterModel");
const requestModel = require("../models/requestModel");

const createRequest = async (req, res) => {
  try {
    //Filtro 1. ¿Está logueado?
    if (!req.user) {
      return res.status(401).json({
        status: "failed",
        message: "Inicie sesión antes de proceder con la solicitud de adopción",
      });
    }
    //Extraemos ID del animal por la URL
    const animalId = req.params.animalId;

    //Filtro 2. ¿El animal existe en la BBDD?
    const animal = await animalModel.findById(animalId);

    if (!animal) {
      return res.status(404).json({
        status: "failed",
        message: "Animal no localizado, revise la ID del animal proporcionado",
      });
    }
    //Filtro 3. ¿El animal está disponible?
    if (animal.status !== "available") {
      return res.status(403).json({
        status: "failed",
        message: "Animal ya adoptado, imposible generar solicitud",
      });
    }

    //Extraemos datos del usuario con el payload
    const { userId, email, userType, name } = req.user;
    applicantUser = await userModel.findById(userId);

    //Filtro 4. ¿El usuario nos ha proporcionado los datos necesarios?
    /* 
        Gran parte de los datos de User son opcionales por si un usuario quiere registrarse sin proporcionar datos , pero si
        el usuario quiere crear animales o hacer una solicitud, estos datos serán exigidos por el sistema, con motivo de seguridad
        del bienestar animal y de proporcionar los datos necesarios a los propietarios actuales (protectoras y usuarios)
      */
    const requiredFields = [
      "name",
      "lastname",
      "NIF",
      "birth",
      "phone",
      "locality",
      "province",
      "address",
      "age",
    ];

    //Revisamos con Every que todos los campos requeridos se encuentren Y que sea adopter:
    if (!requiredFields.every((field) => applicantUser[field])) {
      return res.status(400).json({
        status: "failed",
        message:
          "Indique los siguientes datos en su perfil: NIF, Nombre, Apellidos, Teléfono, Localidad, Provincia, Dirección y Edad para realizar una solicitud de adopción",
      });
    }

    if (applicantUser.userType !== "adopter") {
      return res.status(402).json({
        status: "failed",
        message:
          "El usuario no adoptante, administradores y protectoras NO PUEDEN realizar solicitudes de adopción",
      });
    }

    //Every => https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/every
    //LaSi se encuentran todos los datos entra en el bloque:

    //Filtro 5. REVISAMOS MAYORÍA DE EDAD
    const applyDate = new Date(); //Usaremos esta constante para crear la solicitud (requestModel)
    const ageDiff = applyDate - applicantUser.birth; //Restamos con la fecha de nacimiento para saber la mayoría de edad actual (Resultado en ms)
    const age = Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
    /*
        Explicación de fórmula:
        365.25 => No es 365, porque se tiene en cuanta los años bisiestos (1 cada 4 años = 1 / 4 = 0.25)
        24 (horas que tiene cada día)
        60 (minutos que tiene cada hora)
        60 (segundos que tiene cada minuto)
        1000 (milisegundos que tiene cada segundo)
        */

    console.log(`TEST: La edad del solicitante es de ${age} años`);

    if (age < 18) {
      return res.status(451).json({
        status: "failed",
        message: `Imposible realizar la solicitud siendo menor de 18 años`,
      });
    }

    //El usuario ha pasado todos los controles => RECOGEMOS DATOS DEL .owner DEL ANIMAL:
    actualOwnerId = animal.owner.ownerId; //Extraemos ID

    //Elaboración de ficha de request en funcion de propietario.
    let transfer;
    if (animal.owner.ownerType === "adopter") {
      transfer = await userModel.findById(actualOwnerId);
    } else {
      transfer = await shelterModel.findById(actualOwnerId);
    }

    const newRequest = new requestModel({
      applyDate,
      status: "pending",
      applicantId: applicantUser._id,
      applicantNIF: applicantUser.NIF,
      applicantName: applicantUser.name,
      applicantLastname: applicantUser.lastname,
      applicantEmail: applicantUser.email,
      applicantPhone: applicantUser.phone,
      applicantAddress: applicantUser.address,
      applicantProvince: applicantUser.province,
      applicantLocality: applicantUser.locality,
      reqAnimalId: animal._id,
      reqAnimalSpecie: animal.specie,
      reqAnimalSize: animal.size,
      reqAnimalName: animal.name,
      reqAnimalNumberId: animal.numberID,
      reqAnimalBreed: animal.breed,
      reqAnimalGender: animal.gender,
      reqAnimalBirthDate: animal.birthDate,
      reqAnimalMainColor: animal.mainColor,
      reqAnimalPhysicFeatures: animal.physicFeatures,
      reqAnimalCost: animal.cost,
      transferType: animal.owner.ownerType,
      transferId: actualOwnerId,
      transferNIF: transfer.NIF,
      transferName: transfer.name,
      transferLastname: transfer.lastname,
      transferPhone: transfer.phone,
      transferEmail: transfer.email,
      transferAddress: transfer.address,
      transferProvince: transfer.province,
      transferLocality: transfer.locality,
    });

    await newRequest.save();
    //AHORA EMAIL SERVICE Y CREACION DE PDF

    res.status(201).json({
      status: "succeed",
      message: "Solicitud creada correctamente",
      newRequest,
    });
  } catch (error) {
    return rest.status(500).json({
      status: "failed",
      message: "No se puede completar la solicitud de adopcion",
      error: error.message,
    });
  }
};

module.exports = { createRequest };
