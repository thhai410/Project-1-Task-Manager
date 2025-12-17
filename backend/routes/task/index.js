const express = require("express");
const router = express.Router();
const addTask = require("./add-task");
const deleteTask = require("./delete-task");
const getTasks = require("./get-task");
const updateTask = require("./update-task");

// ROUTES * /api/task/
router.post("/add-task", addTask);
router.delete("/delete-task", deleteTask);
router.get("/get-tasks", getTasks);
router.put("/update-task/:id", updateTask);

module.exports = router;