const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  nie: {
    type: String,
    require: false,
    unique: true,
  },
  address: {
    type: String,
    require: false,
  },
  contactNumber: {
    type: String,
    require: false,
  },
  userType: {
    type: String,
    require: true,
    enum: ["adopter", "provider", "administrator"],
  },
  animalLimit: {
    type: Number,
  },
});

const user = mongoose.model("Users", userSchema, "User");

module.exports = user;
