const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  registerDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["avaliable", "adopted"],
    required: true,
    default: "avaliable",
  },
  specie: {
    type: String,
    enum: ["Perros", "Gatos", "Roedores", "Aves", "Otros"],
    required: true,
  },
  size: {
    type: String,
    enum: ["Grande", "Mediano", "Pequeño"],
    required: false,
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
  photo: {
    type: [String],
    required: false,
  },
  urgent: {
    type: Boolean,
    default: false,
    required: false,
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
  adopter: {
    type: String,
    default: "",
    required: false,
  },
});

const animalModel = mongoose.model("Animals", animalSchema, "Animals");

module.exports = animalModel;
