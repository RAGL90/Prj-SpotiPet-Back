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

//Todos los modelos serán requeridos en este módulo:
const animalModel = require("../models/animalModel");
const userModel = require("../models/userModels");
const shelterModel = require("../models/shelterModel");
const requestModel = require("../models/requestModel");

//Utilidades internas
const timeStamp = require("../core/utils/timeStamp");

//Servicios de email:
const userInfoAnotherAdoptedPet = require("../core/services/messages/userInfoAnotherAdoptedPet");
const userInfoGrantedAdoption = require("../core/services/messages/userInfoGrantedAdoption");
const userInfoRefusedRequest = require("../core/services/messages/userInfoRefusedRequest");
const emailService = require("../core/services/emailService");

//Servicio de PDFKit:
const createAdoptionContract = require("../core/services/generatorPDF");

//Servicios de lectura y manejo de archivos para: getContract()
const fs = require("fs");
const path = require("path");

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
      console.log(animal.status);

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
        365.25 => No es 365, porque se tiene en cuenta los años bisiestos (1 cada 4 años => 1 / 4 = 0.25)
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

    if (applicantUser._id == animal.owner.ownerId) {
      return res.status(400).json({
        status: "failed",
        message: "El adoptante no puede ser el mismo que el cedente",
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

    //EMAIL SERVICE

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
  let { page = 1, limit = 20, status } = req.query;
  limit = Math.min(limit, 50); // Límite máximo de 50 para evitar consultas masivas

  try {
    const { shelterId, userId } = req.user; //El payload traerá uno de estos campos
    const userType = shelterId ? "shelter" : "user"; //Con el ternario filtramos las dos situaciones usuario con puesta de adopcion o protectora
    const user =
      userType === "shelter"
        ? await shelterModel.findById(shelterId)
        : await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "No está identificado, por favor, inicie sesión",
      });
    }

    // PREPARAMOS LA CONSULTA
    // 1º creamos objeto query para la consulta de solicitudes
    // --Buscar todas las ID del array user.request
    let query = { _id: { $in: user.requests } };

    // 2º ¿Se indica status? => Añadimos "status" al objeto query
    if (status) {
      query.status = status;
    }

    // 3º Hacemos conteo de todos los documentos Request que coincidan con (query) el objeto de consulta de busqueda:
    // (Este conteo es solo para mostrar el número de resultados)
    const total = await requestModel.countDocuments(query);

    // 4º Hacemos la consulta real
    const requests = await requestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit) //Iremos en limites a priori de 20 en 20 o 50 en 50 como máximo, se establece al principio del controller.
      .exec(); //Método en Mongoose que se usa para ejecutar una consulta que devuelve una promesa

    return res.status(200).json({
      status: "success",
      data: requests,
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

const userReadRequest = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Usuario no identificado, por favor, inicie sesión",
      });
    }

    if (!user.applications || user.applications.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "No has realizado ninguna solicitud de adopción",
      });
    }

    const arrayApplicationToPromise = user.applications.map((requestId) =>
      requestModel.findById(requestId)
    );
    const arrayApplications = await Promise.all(arrayApplicationToPromise);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = arrayApplications.length;
    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      status: "success",
      data: arrayApplications.slice((page - 1) * limit, page * limit),
      page,
      pages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Error en la operación de búsqueda de solicitudes del usuario",
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

    // Indicamos respuesta en caso de que ya esté aceptada la solicitud para otro usuario
    if (acceptedRequest) {
      return res.status(409).json({
        status: "failed",
        message:
          "Solicitud del animal ya aceptado para otro usuario, no se puede aceptar",
      });
    }

    const { choice, description } = req.body;
    const applyUser = await userModel.findById(request.applicantId);
    const animal = await animalModel.findById(request.reqAnimalId);

    if (choice === "accepted") {
      //Se decide aceptar solicitud buscamos al usuario de la solicitud para sumar en 1 el limite de animales (hasta 3).
      applyUser.animalLimit++;

      if (!animal) {
        return res.status(404).json({
          status: "failed",
          message: "Animal no encontrado",
        });
      }

      animal.status = "adopted";
      request.status = "accepted";

      await applyUser.save();
      await animal.save();
      await request.save();

      if (animal.status === "adopted") {
        //Abrimos este if para sacar del scope las mismas constantes que serán declaradas abajo en el email y no provocar conflictos.
        const messageSubject = `Spot My Pet 🐾 - ¡Felicidades! ¡Has sido seleccionado para adoptar a  ${animal.name}! 😄`;
        const message = await userInfoGrantedAdoption(
          applyUser.name,
          animal.name,
          user.name,
          user.email,
          user.phone
        );
        await emailService.sendEmail(applyUser.email, messageSubject, message);
      }
      //GENERAMOS CONTRATO PDF - Enviandole los objetos completos:
      await createAdoptionContract(applyUser, user, animal, requestId);

      //Recopilamos todos los request en estado "pending"
      const requests = await requestModel.find({
        reqAnimalId: animal._id,
        status: "pending",
      });

      //Procedemos a enviarles el email:
      if (requests) {
        //Habían solicitantes:
        //Procedemos a enviar su email informativo usando "For of" (de ES6) => Recorremos el array extraido en mongoose:
        for (const request of requests) {
          //Generamos asunto:
          const messageSubject = `Spot My Pet 🐾 - Actualización sobre tu solicitud de adopción de ${animal.name}`;
          //Promesa (porque el envío de email puede fallar)
          try {
            //Generamos mensaje con la plantilla de deleted
            const message = await userInfoAnotherAdoptedPet(
              request.applicantName,
              animal.name,
              user.name
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

      /* 
      Si la solicitud se acepta, rechazamos todas las demás solicitudes para el mismo animal.
      
      Con updateMany de Mongoose y filtrando el id del animal localizamos todas aquellas solicitudes del animal en estado "Pending".
      Modificamos que su estado pase a rechazado, indicando una descripción del motivo del rechazo y se lanza el email
      */

      await requestModel.updateMany(
        { reqAnimalId: request.reqAnimalId, status: "pending" }, //Filtro de busqueda
        {
          //Accion para cada encuentro de la busqueda
          $set: {
            status: "refused",
            refusedDescr: `Se ha cedido la mascota ${animal.name} a otro usuario ¡Lamentamos las molestias!`,
          },
        }
      );
    } else {
      //La solicitud se ha rechazado por el propietario:
      request.status = "refused";
      request.refusedDescr = description; //Motivos de negación de la solicitud (si la protectora quiere expresarlo)
      await request.save();

      const messageSubject = `Spot My Pet 🐾 - Actualización sobre tu solicitud de adopción de ${animal.name}`;
      const message = await userInfoRefusedRequest(
        applyUser.name,
        animal.name,
        request.refusedDescr
      );
      await emailService.sendEmail(applyUser.email, messageSubject, message);
    }
    return res.status(200).json({
      status: "success",
      message: `Declarado el nuevo estado de la solicitud a ${choice}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "No se puede realizar solicitud",
      error: error.message,
    });
  }
};

const getContract = async (req, res) => {
  try {
    //1º Revisamos Logueo:
    if (!req.user) {
      return res.status(401).json({
        status: "failed",
        message: "Debe iniciar sesión para esta solicitud",
      });
    }

    //2º Extraemos quien es por el payload, según el dato aportado.
    const { shelterId, userId } = req.user;

    //3º Con el ternario clasificamos cual de los dos tipos de usuario es:
    const userType = shelterId ? "shelter" : "user";

    //4º Con user Recopilamos los datos en funcion del tipo de usuario.
    const user =
      userType === "shelter"
        ? await shelterModel.findById(shelterId)
        : await userModel.findById(userId);

    //5º Si no encontramos usuario, se saca del sistema.
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Usuario no registrado",
      });
    }

    //6º Recogemos que ID del contrato es la que busca.
    const requestId = req.params.requestId;
    const request = await requestModel.findById(requestId);

    //7º Si el usuario no es ni el adoptante ni el creador del animal, lo echamos de aquí
    if (!user._id === request.applicantId || !user._id === request.transferId) {
      return res.status(401).json({
        status: "failed",
        message: "Usuario identificado sin permiso para hacer esta solicitud",
      });
    }

    //8º Buscamos el pdf indicado:
    const filePath = path.resolve(__dirname, `../contracts/${requestId}.pdf`);

    //9º Comprobación de que el archivo exista:
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "failed",
        message: "archivo no localizado, lamentamos las molestias",
      });
    }

    //10º Preparamos el header indicando que tipo de archivo vamos a enviar:
    res.setHeader("Content-Type", "application/pdf");

    //11º Configuramos el "adjunto"
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${requestId}.pdf`
    );

    //11º Crear una red stream  y enviar el archivo:
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Imposible cumplir la solicitud",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  choiceRequest,
  getContract,
  userReadRequest,
};
