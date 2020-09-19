const mongoose = require("mongoose");

const schema = mongoose.Schema({
    _id: { type: String },
	maintenance: { type: Boolean, default: false },
	maintenanceReason: { type: String, default: "" }
});

module.exports = mongoose.model("Cmd", schema);