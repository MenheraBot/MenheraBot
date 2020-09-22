const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    id: {type: String},
    nome: {type:String, default: null},
    mamadas: {type:Number, default: 0},
    mamou: {type:Number, default: 0},
    casado: {type:String, default: "false"},
    nota: {type: String, default: "Eu amo a Menhera >.<\nVocê pode alterar esta mensagem com m!sobremim"},
    data: {type: String, default: undefined},
    status: {type: String, default: "Vivo"},
    shipValue: {type: String, default: null},
    ban: {type: Boolean, default: false},
    banReason: {type: String, default: null},
    afk: {type: Boolean, default: false},
    afkReason: {type: String, default: null},
    verified: {type: Boolean, default: false},
    caçados: {type: Number, default: 0},
    caçarTime: {type: String, default: "000000000000"},
    rolls: {type: Number, default: 0},
    rollTime: {type: String, default: "000000000000"},
    estrelinhas: {type: Number, default: 0}
});

module.exports = mongoose.model("usersdb", userSchema);