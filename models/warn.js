const mongoose = require("mongoose");
const { stripIndents } = require("common-tags");

const userSchema = mongoose.Schema({
    userId: String,
    warnerId: String,
    guildId: String,
    reason: String,
    data: String
});

module.exports = mongoose.model("usersdb", userSchema);