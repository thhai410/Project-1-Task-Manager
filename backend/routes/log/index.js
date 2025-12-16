const express = require("express");
const router = express.Router();
const addLog = require("./add-log");
const deleteLog = require("./delete-log");


// ROUTES * /api/log
router.post("/add-log", addLog);
router.delete("/delete-log", deleteLog);

module.exports = router;