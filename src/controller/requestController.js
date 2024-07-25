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
    //¿Está logueado?
    if (!req.user) {
      return res.status(401).json({
        status: "failed",
        message: "Inicie sesión antes de proceder con la solicitud de adopción",
      });
    }
    //Extraemos ID de la URL
    const animalId = req.params.animalId;

    //Obtenemos datos del animal
    const animal = await animalModel.findById(animalId);

    //No se localiza el animal:
    if (!animal) {
      return res.status(404).json({
        status: "failed",
        message: "Animal no localizado, revise la ID del animal proporcionado",
      });
    }

    //Revisamos disponibilidad:
    if (animal.status === "avaliable") {
      //Extraemos datos del usuario con el payload
      const { userId, email, userType, name } = req.user;
      applicantUser = await userModel.findById(userId);

      //Revisamos que tenga los datos proporcionados en la plataforma:
      //Indicamos que campos de User necesitamos
      const requiredFields = [
        "name",
        "lastname",
        "NIF",
        "phone",
        "locality",
        "province",
        "address",
        "age",
      ];

      if (requiredFields.every((field) => applicantUser[field])) {
        //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/every
        //Si todos los datos son correctos (true) entra aqui:

        //REVISAMOS MAYORÍA DE EDAD
        const applyDate = new Date(); //Usaremos esta constante en el request
        const birthDate = new Date(user.birthDate); //Reaseguramos que los datos obtenidos de user es formato Date
        const ageDiff = applyDate - birthDate; //Diferencia (En ms) por las operaciones de cálculo temporal de JS.
        const diffDate = new Date(ageDiff); //Volvemos a transformar en UTC los milisegundos.
        const age = diffDate.getFullYear(); //Extraemos el año.

        if (age < 18) {
          return res.status(451).json({
            status: "failed",
            message: `Imposible realizar la solicitud con menos de 18 años`,
          });
        }

        //El usuario ha pasado todos los controles => RECOGEMOS DATOS DEL .owner DEL ANIMAL:
        actualOwnerId = animal.owner.ownerId; //Extraemos ID

        if (animal.owner.ownerType === "adopter") {
          const transfer = await userModel.findById(actualOwnerId); //Si es un usuario el actual propietario
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
        } else {
          const transfer = await shelterModel.findById(actualOwnerId); // Protectora
          const newRequest = new requestModel({
            applyDate,
            status: "pending",
            applicantId: applicantUser._id,
            applicantNIF: applicantUser.NIF,
            applicantName: applicantUser.name,
            applicantLastname: null,
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
        }

        await newRequest.save();
      } else {
        return res.status(451).json({
          status: "failed",
          message: `Indique los siguientes datos en su perfil:
            NIF, Nombre, Apellidos, Teléfono, Localidad, Provincia y Dirección y Edad para realizar una solicitud de adopcion`,
        });
      }
    } else {
      //Animal NO disponible
      return res.status(404).json({
        status: "Forbidden",
        message: "Animal ya adoptado, imposible generar solicitud",
      });
    }
  } catch (error) {}
};
