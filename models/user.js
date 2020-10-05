const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    id: {type: String},
    nome: {type:String, default: null},
    mamadas: {type:Number, default: 0},
    mamou: {type:Number, default: 0},
    casado: {type:String, default: "false"},
    nota: {type: String, default: "Eu amo a Menhera >.<\nVocê pode alterar esta mensagem com m!sobremim"},
    data: {type: String, default: undefined},
    shipValue: {type: String, default: null},
    ban: {type: Boolean, default: false},
    banReason: {type: String, default: null},
    afk: {type: Boolean, default: false},
    afkReason: {type: String, default: null},
    cor: {type: String, default: '#a788ff'},
    cores: {type: Array, default: [{nome: "0 - Padrão", cor: "#a788ff", preço: 0}]},
    caçados: {type: Number, default: 0},
    anjos: {type: Number, default: 0},
    semideuses: {type: Number, default: 0},
    deuses: {type: Number, default: 0},
    caçarTime: {type: String, default: "000000000000"},
    rolls: {type: Number, default: 0},
    rollTime: {type: String, default: "000000000000"},
    estrelinhas: {type: Number, default: 0},
    votos: {type: Number, default: 0}
});

module.exports = mongoose.model("usersdb", userSchema);