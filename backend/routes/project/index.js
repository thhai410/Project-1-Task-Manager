const express = require("express");
const router = express.Router();
const addProject = require("./add-prj");
const deleteProject = require("./delete-prj");
const getProjects = require("./get-prj");
const addMember = require("./add-member");

// ROUTES * /api/project/
router.post("/add-prj", addProject);
router.delete("/delete-prj", deleteProject);
router.get("/get-prj", getProjects);
router.post("/:id/add-member", addMember);

module.exports = router;