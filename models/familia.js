const mongoose = require("mongoose");

const familiaSchema = mongoose.Schema({
    _id: { type: String },
    abilities: {type: Array},
    boost: {type: Object},
    members: {type: Array, default: []},
    levelFamilia: {type: Number, default: 1},
    bank: {type: String, default: "0"},
    nextLevel: {type: String, default: "15000"}
});

module.exports = mongoose.model("Familia", familiaSchema);