const mongoose = require("mongoose");

const rpgSchema = mongoose.Schema({
  _id: {type: String},
  class: {type: String},
  life: {type: Number, default: 100},
  armor: {type: Number, default: 0},
  damage: {type: Number, default: 0},
  mana: {type: Number, default: 0},
  maxLife: {type: Number, default: 100},
  maxMana: {type: Number, default: 20},
  abilityPower: {type: Number, default: 0},
  level: {type: Number, default: 0},
  xp: {type: Number, default: 0},
  nextLevelXp: {type: Number, default: 10},
  abilities: {type: Array, default: []},
  abilitiesCooldown: {type: Array, default: []},
  uniquePower: {type: Object},
  loots: {type: Array, default: []},
  inventory: {type: Array, default:[]},
  money: {type: Number, default: 0},
  dungeonCooldown: {type: String, default: "00000000"},
  death: {type: String, default: "00000000"},
  weapon: {type: Object},
  protection: {type: Object, default: {name: "Armadura Padrão", armor: 1}},
  hotelTime: {type: String, default: "00000000"},
  inBattle: {type: Boolean, default: false},
  hasFamily: {type: Boolean, default: false},
  familyName: {type: String, default: null}
});

module.exports = mongoose.model("rpg", rpgSchema);