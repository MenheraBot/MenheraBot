const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    id: String,
    nome: String,
    mamadas: Number,
    mamou: Number,
    casado: String,
    nota: String,
    data: String,
    status: {type: Number, default: 1}
});

module.exports = mongoose.model("usersdb", userSchema);