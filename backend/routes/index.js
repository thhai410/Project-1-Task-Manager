const express = require("express");
const { tokenVerification } = require("../middleware");
const auth = require("./auth");
const router = express.Router();

router.use("/auth", auth);

module.exports = router;