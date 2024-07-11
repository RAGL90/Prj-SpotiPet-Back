const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const provincias = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "La Coruña",
  "Cuenca",
  "Gerona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Jaén",
  "León",
  "Lérida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Orense",
  "Palencia",
  "Las Palmas",
  "Pontevedra",
  "La Rioja",
  "Salamanca",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Santa Cruz de Tenerife",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
  "Mallorca",
  "Menorca",
  "Ibiza",
  "Formentera",
  "Ceuta",
  "Melilla",
];

const shelterSchema = new Schema({
  tipoNIF: {
    type: String,
    enum: ["DNI", "NIE", "CIF"],
    required: true,
  },
  NIF: {
    type: String,
    unique: [true, "Este NIF ya ha sido registrado"],
    trim: true,
    required: [
      true,
      "El NIF es obligatorio para la realización de solicitudes",
    ],
  },
  name: {
    type: String,
    required: [true, "El nombre de la protectora es obligatorio"],
  },
  province: {
    type: String,
    required: [
      true,
      "La provincia es necesaria para ayudar a los usuarios a localizarte",
    ],
    enum: {
      values: provincias,
      message: "No es una provincia válida",
    },
    trim: true,
  },
  locality: {
    type: String,
    required: [
      true,
      "La localidad es necesaria para ayudar a los posibles adoptantes a su recogida",
    ],
  },
  adress: {
    type: String,
    required: [
      true,
      "Facilitar el campo para que el usuario pueda recoger personalmente a su nueva mascota si lo desea",
    ],
  },
  phone: {
    type: String,
    required: [
      true,
      "El telefono es necesario para facilitar el contacto con el posible adoptante",
    ],
    match: [
      /^[679]\d{8}$/,
      "Numero de telefono incorrecto, no es necesario indicar el prefijo (+34)",
    ],
    unique: true,
    minLength: 9,
  },
  email: {
    type: String,
    required: [
      true,
      "El correo es obligatorio para informar de las solicitudes de los usuarios",
    ],
    unique: true,
    trim: true,
    minLength: 6,
    match: [/^\S+@\S+\.\S+$/, "Correo incorrecto"],
  },
  pswd: {
    type: String,
    required: [true, "La contraseña es obligatoria, al menos 8 caracteres"],
    trim: true,
    minLength: 8,
  },
  tipoAsociacion: {
    //Lo determina el sistema en función del NIF
    type: String,
    default: "",
    required: false,
  },
  uncommon: {
    //Lo determina el sistema en función del NIF
    type: Boolean,
    default: false,
    required: false,
  },
  web: {
    type: String,
    default: "",
    required: false,
  },
  socialMedia: {
    type: [String],
    default: [],
    required: false,
  },
});

const shelterModel = mongoose.model("shelter", shelterSchema, "shelter");

module.exports = shelterModel;
