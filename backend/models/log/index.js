const mongoose = require("mongoose");
const logSchema = require("./log-schema");

const log = mongoose.model("logs", logSchema);

module.exports = log;