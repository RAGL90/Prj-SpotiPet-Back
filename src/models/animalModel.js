const mongoose = require("mongoose");
const shelterModel = require("./shelterModel");
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  animalType: {
    type: String,
    enum: ["Perro", "Gato", "Roedores", "Aves"],
    required: true,
  },
  size: {
    type: String,
    enum: ["Grande", "Mediano", "Pequeño"],
    required: function () {
      return this.type === "Perro"; //Requerido si se marca Perro
    },
  },
  name: {
    type: String,
    trim: true,
    require: true,
  },
  age: {
    type: String, //String porque se indican "meses" a veces
    require: true,
  },
  gender: {
    type: String,
    enum: ["hembra", "macho"],
    require: true,
  },
  description: {
    type: String,
    require: false,
    default: false,
  },
  breed: {
    type: String,
    require: false,
  },
  photo: {
    type: [String],
    require: false,
  },
  urgent: {
    type: Boolean,
    default: false,
    require: false,
  },
  owner: {
    ownerId: {
      type: String,
      required: [true, "No se ha recibido la ID del usuario"],
    },
    ownerType: {
      type: String,
      enum: ["shelter, user"],
      required: true,
    },
    ownerName: {
      //Será asignado por el controller
      type: String,
      required: true,
    },
  },
});

const animalModel = mongoose.model("Animals", animalSchema, "Animals");

module.exports = animalModel;
