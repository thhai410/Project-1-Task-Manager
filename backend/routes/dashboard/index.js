const express = require("express");
const router = express.Router();
const getDashboardStats = require("./get-dashboard");

// ROUTES * /api/dashboard
router.get("/get-dashboard", getDashboardStats);


module.exports = router;