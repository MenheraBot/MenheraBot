const mongoose = require("mongoose");

const mobSchema = mongoose.Schema({
  type: String,
  name: String,
  life: Number,
  damage: Number,
  armor: Number,
  xp: Number,
  loots: Array
});

module.exports = mongoose.model("mob", mobSchema);