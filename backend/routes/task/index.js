const express = require("express");
const router = express.Router();
const addTask = require("./add-task");
const deleteTask = require("./delete-task");

// ROUTES * /api/task/
router.post("/add-task", addTask);
router.delete("/delete-task", deleteTask);

module.exports = router;