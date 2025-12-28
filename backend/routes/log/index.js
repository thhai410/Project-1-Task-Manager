const express = require("express");
const router = express.Router();
const addLog = require("./add-log");
const deleteLog = require("./delete-log");
const getLogs = require("./get-log");
const updateLog = require("./update-log");
const { tokenVerification } = require("../../middleware");

// ROUTES * /api/log
router.post("/add-log", tokenVerification, addLog);
router.delete("/delete-log", tokenVerification, deleteLog);
router.get("/get-log", tokenVerification, getLogs);
router.put("/update-log", tokenVerification, updateLog);

module.exports = router;