const express = require("express");
const router = express.Router();
const getAdminStats = require("./get-admin-stats");
const getAllUsers = require("./get-all-users");
const getAllProjects = require("./get-all-projects");
const getAllTasks = require("./get-all-tasks");
const getAllLogs = require("./get-all-logs");

// ROUTES * /api/admin
router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/projects", getAllProjects);
router.get("/tasks", getAllTasks);
router.get("/logs", getAllLogs);

module.exports = router;