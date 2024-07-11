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
    unique: true,
    trim: true,
    required: [
      true,
      "El NIF es obligatorio para la realización de solicitudes",
    ],
  },
  nombre: {
    type: String,
    required: [true, "El nombre de la protectora es obligatorio"],
  },
  provincia: {
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
  localidad: {
    type: String,
    required: [
      true,
      "La localidad es necesaria para ayudar a los usuarios a localizarte",
    ],
  },
  direccion: {
    type: String,
    required: [
      true,
      "Facilitar el campo para que el usuario pueda recoger personalmente a su nueva mascota si lo desea",
    ],
  },
  telefono: {
    type: Number,
    require: [
      true,
      "El teléfono es necesario para facilitar el contacto con el posible adoptante",
    ],
    trim: true,
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
    type: String,
    default: "",
    require: false,
  },
  raro: {
    type: Boolean,
    default: false,
    require: false,
  },
  web: {
    type: String,
    default: "",
    require: false,
  },
  socialMedia: {
    type: [String],
    default: [""],
    require: false,
  },
});

const shelterModel = mongoose.model("shelter", shelterSchema, "shelter");

module.exports = shelterModel;
