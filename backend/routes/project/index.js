const express = require("express");
const router = express.Router();
const addProject = require("./add-prj");
const deleteProject = require("./delete-prj");
const getProjects = require("./get-prj");
const addMember = require("./add-member");
const getProjectDetail = require("./get-detail");
const updateProject = require("./update-prj")
const { tokenVerification } = require("../../middleware");

// ROUTES * /api/project/
router.post("/add-prj", tokenVerification, addProject);
router.delete("/delete-prj", tokenVerification, deleteProject);
router.get("/get-prj", tokenVerification, getProjects);
router.post("/add-member/:id", tokenVerification, addMember);
router.get("/get-detail", tokenVerification, getProjectDetail);
router.put("/update-prj", tokenVerification, updateProject);

module.exports = router;