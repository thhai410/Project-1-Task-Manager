const express = require("express");
const router = express.Router();
const addProject = require("./add-prj");
const deleteProject = require("./delete-prj");

// ROUTES * /api/project/
router.post("/add-prj", addProject);
router.delete("/delete-prj", deleteProject);

module.exports = router;