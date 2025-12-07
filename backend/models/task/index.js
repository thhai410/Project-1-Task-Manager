const mongoose = require("mongoose");
const taskSchema = require("./task-schema");

const task = mongoose.model("tasks", taskSchema);

module.exports = task;