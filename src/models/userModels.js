const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    enum: ["adopter", "admin"],
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
    default: "",
  },
  age: {
    type: Number,
    require: false,
    default: 0,
  },
  animalLimit: {
    type: Number,
    require: true,
    default: 0,
    max: [
      3,
      "Has alcanzado el límite anual de adopciones por usuario, si requiere de más adopciones contacte con el administrador",
    ],
  },
});

const userModel = mongoose.model("Users", userSchema, "User");

module.exports = userModel;
