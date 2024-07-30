const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  registerDate: {
    type: Date,
    required: false, //Aunque sea False, el controller lo va a añadir automáticamente.
    index: true,
  },
  status: {
    type: String,
    enum: ["available", "adopted"],
    required: true,
    default: "available",
  },
  specie: {
    type: String,
    enum: ["Perros", "Gatos", "Roedores", "Aves", "Otros"],
    required: true,
    index: true, //Para consultas sobre tipo de animal
  },
  size: {
    type: String,
    enum: ["Grande", "Mediano", "Pequeño"],
    required: false,
    index: true, //Para consultas que necesiten un filtrar el tamaño del perro
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  hairType: {
    type: String,
    required: false,
  },
  numberID: {
    type: String,
    required: false,
  },
  breed: {
    type: String,
    required: [
      true,
      "Es necesario indicar la raza del animal para el formulario, además de proporcionar detalles al posible adoptante",
    ],
    index: true,
  },
  birthDate: {
    type: Date,
    //                       Year  month day, hour, minute, second
    //date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
    required: [true, "La fecha de nacimiento es necesaria"],
  },
  physicFeatures: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    enum: ["hembra", "macho"],
    required: true,
  },
  mainColor: {
    type: String,
    required: [
      true,
      "Es necesario indicar el color principal o colores del animal",
    ],
  },
  description: {
    type: String,
    required: false,
    default: false,
  },
  cost: {
    type: Number,
    required: false,
    default: 0,
  },
  photo: {
    type: [String],
    required: false,
  },
  urgent: {
    type: Boolean,
    default: false,
    required: false,
    index: true,
  },
  owner: {
    //Será asignado por el controller con el payload de la sesion
    ownerId: {
      type: String,
      required: [true, "No se ha recibido la ID del usuario"],
    },
    ownerType: {
      type: String,
      enum: ["adopter", "shelter"],
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
  },
  adopted: {
    type: Boolean,
    default: false,
    required: false,
  },
});

// Índice generado para abrir rápidamente en función de urgent y registerDate (Consulta principal al llegar un usuario a la web).
animalSchema.index({ urgent: -1, registerDate: -1 });

const animalModel = mongoose.model("Animals", animalSchema, "Animals");

module.exports = animalModel;
