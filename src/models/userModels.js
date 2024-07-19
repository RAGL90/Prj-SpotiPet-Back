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

const userSchema = new Schema({
  registerDate: {
    type: Date,
    required: false,
  },
  email: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    trim: true,
    minLength: 6,
    match: [/^\S+@\S+\.\S+$/, "Correo incorrecto"],
  },
  pswd: {
    type: String,
    required: [true, "Contraseña obligatoria"],
    trim: true,
    minLength: [8, "Tiene que ser mayor de 8 caracteres"],
  },
  userType: {
    type: String,
    require: true,
    enum: ["adopter", "admin", "deletedUser"],
    default: "adopter",
  },
  username: {
    type: String,
    require: false,
  },
  lastname: {
    type: String,
    require: false,
  },
  tipoNIF: {
    type: String,
    enum: ["DNI", "NIE", ""], //Las empresas no serán NIF elegibles en la solicitud
    required: false,
    default: "",
  },
  NIF: {
    type: String,
    require: false,
    unique: true,
    default: "Sin NIF",
  },
  province: {
    type: String,
    required: false,
    enum: {
      values: provincias,
      message: "No es una provincia válida",
    },
    trim: true,
  },
  locality: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
    default: 0,
  },
  phone: {
    type: String,
    required: false,
    match: [
      /^[679]\d{8}$/,
      "Numero de telefono incorrecto, no es necesario indicar el prefijo (+34)",
    ],
    unique: true,
    minLength: 9,
  },
  animalLimit: {
    type: Number,
    require: true,
    default: 0,
    max: [
      3,
      "Has alcanzado el límite anual de adopciones por usuario, si requiere de más adopciones contacte con administración",
    ],
  },
  animalsCreated: {
    type: [String],
    default: [],
    required: false,
  },
  deletedDate: {
    type: Date,
    required: false,
    default: null,
  },
});

//Función incrustada en modelo para limitar creación de animales - Habrá otra funcion en controller
function CreatedUserLimit(value) {
  return value.length <= 3;
}

const userModel = mongoose.model("Users", userSchema, "User");

module.exports = userModel;
