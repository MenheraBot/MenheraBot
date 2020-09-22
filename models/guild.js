const mongoose = require("mongoose");
const config = require("../config.json")

const guildSchema = mongoose.Schema({
  id: {type: String},
  prefix: {type: String, default: config.prefix}
});

module.exports = mongoose.model("guild", guildSchema);