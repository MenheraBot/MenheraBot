const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    id: String,
    nome: String,
    mamadas: Number,
    mamou: Number,
    casado: String,
    nota: String,
    data: String,
    status: String
});

module.exports = mongoose.model("usersdb", userSchema);