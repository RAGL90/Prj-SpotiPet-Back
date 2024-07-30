const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
Se trata de la tabla más relevante de la plataforma, por lo que habrán datos redundantes 
con las otras tablas de dato, el motivo es:
Evitar pérdidas de información en caso de que se elimine o se de baja algunos de los siguientes:

 - Usuario, eliminaremos su información si lo solicita, a excepción de:
    · Una solicitud aceptada, conservaremos sus datos por seguridad del animal y de la protectora.
      (Si el usuario tiene una solicitud pendiente o rechazada en su petición de eliminación del usuario, las solicitudes
      pasarán a ser eliminada del sistema)

 - Animal, si se le da de baja en la plataforma tras tener una solicitud aceptada, tanto el Usuario
   y la Protectora pueden aún obtener la información del animal y ponerse en contacto entre ellos si
   hiciese falta, ej: Información para el adoptante, eventos organizados por la Protectora, etc.

 - Protectora, en caso de darse de baja:
    · Todos sus animales pasarán a ser eliminados de la plataforma.

    · Las solicitudes en estado pendiente "pending" => pasarán a ser "refused" (rechazadas) por derecho de información a 
      los usuarios.

    · Aquellas adopciones realizadas y aceptadas, por seguridad para el adoptante/usuario mantendremos sus datos durante un
      tiempo prudencial (sin definir).

En esta tabla, mantendremos datos por interés legítimo.

*/

const applySchema = new Schema({
  //RECOGIDA DATOS SOLICITANTE ----------------------------- ----------------------------- --------------------------
  applyDate: {
    type: Date,
    index: true, //Queremos que se organice por fechas.
    required: false, //Lo forzaremos en el controller.
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "refused"],
    required: true,
    index: true,
  },
  refusedDescr: {
    type: String,
    required: false,
    default: null,
  },
  applicantId: {
    //ID de BBDD (será indicada automáticamente)
    type: String,
    required: true,
  },
  applicantNIF: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    required: true,
  },
  applicantLastname: {
    type: String,
    required: true,
  },
  applicantEmail: {
    type: String,
    trim: true,
    minLength: 6,
    match: [/^\S+@\S+\.\S+$/, "Correo incorrecto"],
    required: [
      true,
      "El correo es obligatorio para la adopcion y contacto de la Protectora",
    ],
  },
  applicantPhone: {
    type: String,
    match: [
      /^[679]\d{8}$/,
      "Numero de telefono incorrecto, no es necesario indicar prefijo nacional (+34)",
    ],
    minLength: 9,
    required: [
      true,
      "Es necesario indicar el teléfono de contacto para la Protectora",
    ],
  },
  applicantAddress: {
    type: String,
    required: true,
  },
  applicantProvince: {
    type: String,
    required: false,
  },
  applicantLocality: {
    type: String,
    required: false,
  },
  //RECOGIDA DATOS ANIMALES ----------------------------- ----------------------------- -----------------------------
  reqAnimalId: {
    //ID de BBDD (será indicada automáticamente)
    type: String,
    required: true,
  },
  reqAnimalSpecie: {
    type: String,
    required: true,
    index: true,
  },
  reqAnimalSize: {
    type: String,
    enum: ["Grande", "Mediano", "Pequeño"],
    required: false,
    index: true,
  },
  reqAnimalName: {
    type: String,
    required: true,
  },
  reqAnimalNumberId: {
    //ID del Chip del animal si lo tiene
    type: String,
    required: false,
  },
  reqAnimalBreed: {
    type: String,
    required: true,
    index: true,
  },
  reqAnimalGender: {
    type: String,
    enum: ["hembra", "macho"],
    required: true,
  },
  reqAnimalBirthDate: {
    type: Date,
    required: [true, "La fecha de nacimiento es necesaria"],
  },
  reqAnimalMainColor: {
    type: String,
    required: true,
  },
  reqAnimalPhysicFeatures: {
    type: String,
    required: true,
  },
  reqAnimalCost: {
    type: String,
    required: false,
  },
  //RECOGIDA DATOS CEDENTE ("TRANSFEROR"): PROTECTORA O USUARIO ----------------------------- -----------------------------
  transferType: {
    type: String,
    enum: ["adopter", "shelter"], //Recogemos datos desde animalModel.owner.ownerType
    required: true,
  },
  transferId: {
    //Id de BBDD
    type: String,
    required: true,
  },
  transferNIF: {
    type: String,
    required: true,
  },
  transferName: {
    type: String,
    required: true,
  },
  transferLastname: {
    //En caso de persona física
    type: String,
    required: false,
  },
  transferPhone: {
    type: String,
    required: [
      true,
      "El telefono es necesario para facilitar el contacto con el posible adoptante",
    ],
    match: [
      /^[679]\d{8}$/,
      "Numero de telefono incorrecto, no es necesario indicar el prefijo (+34)",
    ],
    minLength: 9,
  },
  transferEmail: {
    type: String,
    required: [
      true,
      "El correo es obligatorio para informar de las solicitudes de los usuarios",
    ],
    trim: true,
    minLength: 6,
    match: [/^\S+@\S+\.\S+$/, "Correo incorrecto"],
  },
  transferAddress: {
    type: String,
    required: true,
  },
  transferProvince: {
    type: String,
    required: true,
  },
  transferLocality: {
    type: String,
    required: true,
  },
});

//Indice para buscar rápidamente los ID para evitar duplicados
applySchema.index({ applicantId: 1, reqAnimalId: 1 }, { unique: true });

const requestModel = mongoose.model("requests", applySchema, "requests");

module.exports = requestModel;
