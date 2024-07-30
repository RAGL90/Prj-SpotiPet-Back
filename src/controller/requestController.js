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

const timeStamp = require("../core/utils/timeStamp");

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
    if (animal.status != "available") {
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
      "birth",
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

    if (age < 18) {
      return res.status(451).json({
        status: "failed",
        message: `Imposible realizar la solicitud siendo menor de 18 años`,
      });
    }

    const existingRequest = await requestModel.findOne({
      applicantId: applicantUser._id,
      reqAnimalId: animal._id,
    });

    if (existingRequest) {
      return res.status(409).json({
        status: "failed",
        message: "Solicitud ya existente",
      });
    }

    if (applicantUser.animalLimit >= 3) {
      //En ningún caso debe ser mayor a 3.
      return res.status(400).json({
        status: "failed",
        message:
          "Limite de adopciones alcanzado, debe aguardar un año desde la adopción",
      });
    }

    //El usuario ha pasado todos los controles => RECOGEMOS DATOS DEL .owner DEL ANIMAL:
    actualOwnerId = animal.owner.ownerId; //Extraemos ID

    //Elaboración de ficha de request en funcion del tipo de propietario.
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

    transfer.requests.push(newRequest._id); //Se introduce ID de la solicitud en Solicitudes Recibidas
    applicantUser.applications.push(newRequest._id); //Aqui en Solicitudes Enviadas

    await transfer.save();
    await applicantUser.save();

    const time = timeStamp();
    console.log(
      `${time} Solicitud de ${applicantUser.name} para ${animal.name}, propietario: ${transfer.name}`
    );

    //EMAIL SERVICE Y CREACION DE PDF

    res.status(201).json({
      status: "succeed",
      message: "Solicitud creada correctamente",
      newRequest,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "No se puede completar la solicitud de adopcion",
      error: error.message,
    });
  }
};

//-----------------CONSULTA DE SOLICITUDES - PROTECTORA
const getRequests = async (req, res) => {
  //Preestablecemos la vista, a menos que se indique lo contrario.
  let { page, limit } = req.query;

  page = parseInt(page) || 1; // Si no se indica, default: 1
  limit = parseInt(limit) || 20; // default: 20
  limit = limit > 50 ? 50 : limit; //Ternario para no hacer una consulta enorme en el endpoint

  try {
    const { shelterId, userId } = req.user; //El payload traerá uno de estos campos
    const userType = shelterId ? "shelter" : "user"; //Con el ternario filtramos las dos situaciones usuario con puesta de adopcion o protectora

    const user =
      userType === "shelter"
        ? await shelterModel.findById(shelterId)
        : await userModel.findById(userId);

    // Contar el número total de solicitudes
    const total = await requestModel.countDocuments({
      _id: { $in: user.requests },
      //Contar número de documentos en los que en el ID se encuentren las solicitudes
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "No está identificado, por favor, inicie sesión",
      });
    }
    const arrayRequestToPromise = user.requests.map((requestId) =>
      requestModel.findById(requestId)
    );
    const arrayRequest = await Promise.all(arrayRequestToPromise);

    /*
      La intención inicial era hacer un bucle "for" con el número de solicitudes, pero esto hace que haga un AWAIT SECUENCIAL:
      Ej: "1ª ¿Se cumple? Sí, pues pasamos a la 2ª ¿Se cumple? Sí, a la tercera ID del array ¿Se cumple?" y asi sucesivamente.

      Con el uso de Promise.all se ejecutan MÚLTIPLES PROMESAS SIMULTANEAS, iniciándose una búsqueda de todos los indices del array a la vez.
      Esto mejora el rendimiento:
      Si la protectora tiene 10 solicitudes no notaría la diferencia, pero si tiene 500 solicitudes, el tiempo de espera es bastante notable.
    */
    return res.status(200).json({
      status: "success",
      data: arrayRequest,
      //Datos de visualizacion y carga:
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Error en la operación de búsqueda de solicitudes",
      error: error.message,
    });
  }
};

const choiceRequest = async (req, res) => {
  //La protectora o usuario propietario ha obtenido detalles de la solicitud, elige: Aceptar o Rechazar.
  try {
    const { shelterId, userId } = req.user;
    const userType = shelterId ? "shelter" : "user";

    const user =
      userType === "shelter"
        ? await shelterModel.findById(shelterId)
        : await userModel.findById(userId);

    // Filtro de logueo
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Sin autorización para esta solicitud, inicie sesión",
      });
    }

    const requestId = req.params.requestId;
    const request = await requestModel.findById(requestId);

    // Filtro de solicitud inexistente
    if (!request) {
      return res.status(404).json({
        status: "failed",
        message: "Solicitud indicada no existe, revise la ID de la solicitud",
      });
    }

    // Revisamos que no esté aceptado ninguna otra solicitud para el mismo animal
    const acceptedRequest = await requestModel.findOne({
      status: "accepted",
      reqAnimalId: request.reqAnimalId,
    });

    // Indicamos respuesta en caso de que exista
    if (acceptedRequest) {
      return res.status(409).json({
        status: "failed",
        message:
          "Solicitud del animal ya aceptado para otro usuario, no se puede aceptar",
      });
    }

    const { choice, description } = req.body;

    if (choice === "accepted") {
      const applyUser = await userModel.findById(request.applicantId);
      //Se decide aceptar solicitud buscamos al usuario de la solicitud para ampliar el limite de animales (hasta 3) para evitar abusos.
      applyUser.animalLimit++;
      await applyUser.save();

      const animal = animalModel.findById(request.animalId);
      animal.status = "adopted";
      await animal.save();

      request.status = "accepted";
      await request.save();

      /* 
      Si la solicitud se acepta, rechazamos todas las demás solicitudes para el mismo animal
      Para ello, usamos el updateMany de Mongoose indicando como filtro el id del animal y todas aquellas solicitudes NO ACEPTADAS.
      Y modificamos que su estado pase a rechazado, indicando una descripción del motivo del rechazo.

      $ne => not igual (para un único valor)
      $nin => not in (en una enumeración)
      */
      await requestModel.updateMany(
        { reqAnimalId: request.reqAnimalId, status: "pending" }, //Filtro de busqueda
        {
          $set: {
            status: "refused",
            refusedDescr:
              "Animal cedido a otro usuario ¡Lamentamos las molestias!",
          },
        } //Accion para cada encuentro
      );
    } else {
      request.status = "refused";
      request.refusedDescr = description; //Motivos de negación de la solicitud (si la protectora quiere expresarlo)
      await request.save();
    }

    return res.status(200).json({
      status: "success",
      message: `Declarado el nuevo estado de la solicitud a "${choice}"`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se puede realizar solicitud",
      error: error.message,
    });
  }
};

module.exports = { createRequest, getRequests, choiceRequest };
