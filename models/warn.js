const mongoose = require("mongoose");

const warnSchema = mongoose.Schema({
    userId: String,
    warnerId: String,
    guildId: String,
    reason: String,
    data: String
});

module.exports = mongoose.model("warn", userSchema);