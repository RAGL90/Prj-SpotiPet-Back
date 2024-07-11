const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  name: {
    type: String,
    trim: true,
    require: true,
  },
  age: {
    type: String,
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
});
