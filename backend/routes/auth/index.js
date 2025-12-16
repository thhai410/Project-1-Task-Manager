const express = require("express");
const router = express.Router();
const signUp = require("./signup");
const loginUser = require("./login");

// ROUTES * /api/auth/
router.post("/login", loginUser);
router.post("/register", signUp);

module.exports = router;