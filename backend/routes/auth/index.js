const express = require("express");
const router = express.Router();
const signUp = require("./signup");
const loginUser = require("./login");
const getMe = require("./me");
const refreshToken = require("./refresh");
const { tokenVerification } = require("../../middleware");

// ROUTES * /api/auth/
router.post("/login", loginUser);
router.post("/register", signUp);
router.post("/refresh", refreshToken);
router.get("/me", ...getMe);

module.exports = router;