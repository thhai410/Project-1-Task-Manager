const express = require("express");
const router = express.Router();
const addTask = require("./add-task");
const deleteTask = require("./delete-task");
const getTasks = require("./get-task");
const updateTask = require("./update-task");
const { tokenVerification } = require("../../middleware");

// ROUTES * /api/task/
router.post("/add-task", tokenVerification, addTask);
router.delete("/delete-task", tokenVerification, deleteTask);
router.get("/get-tasks", tokenVerification, getTasks);
router.put("/update-task/:id", tokenVerification, updateTask);

module.exports = router;