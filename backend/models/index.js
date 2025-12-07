const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user");
db.project = require("./project");
db.task = require("./task");
db.log = require("./log");

module.exports = db;