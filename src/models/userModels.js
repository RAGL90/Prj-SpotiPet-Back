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
  pswdCode: {
    type: Number,
    required: false,
    default: null,
  },
  userType: {
    type: String,
    required: true,
    enum: ["adopter", "admin", "deletedUser"],
    default: "adopter",
  },
  tipoNIF: {
    type: String,
    enum: ["DNI", "NIE", ""], //Las empresas no serán NIF elegibles en la solicitud
    required: false,
    default: "",
  },
  NIF: {
    type: String,
    required: false,
    unique: true,
    default: "Sin NIF",
  },
  birth: {
    type: Date,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
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
  typeHouse: {
    type: String,
    required: false,
    enum: ["Piso", "Chalet", "Casa", "Otro", "-"],
    default: "-",
  },
  ownHouse: {
    type: String,
    required: false,
    enum: ["Propia", "Alquiler", "-"],
    default: "-",
  },
  //Dispone de jardín vallado
  gardenWall: {
    type: Boolean,
    required: false,
    default: false,
  },
  //LIMITE DE SOLICITUD DE ADOPCIONES
  animalLimit: {
    type: Number,
    required: true,
    default: 0,
    max: [
      3,
      "Has alcanzado el límite anual de adopciones por usuario, si requiere de más adopciones contacte con administración",
    ],
  },
  //LIMITE DE PUESTAS EN ADOPCIONES
  animalsCreated: {
    type: [String],
    default: [],
    required: false,
  },
  //SOLICITUDES REALIZADAS
  applications: {
    type: [String],
    default: [],
    required: false,
  },
  //SOLICITUDES RECIBIDAS
  requests: {
    type: [String],
    required: false,
    default: [],
  },
  //DELETED => Solicita eliminación pero tiene animales en la plataforma o tiene adopciones realizadas.
  deletedDate: {
    type: Date,
    required: false,
    default: null,
  },
});

const userModel = mongoose.model("Users", userSchema, "User");

module.exports = userModel;
