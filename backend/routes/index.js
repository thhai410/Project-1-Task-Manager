const express = require("express");
const { tokenVerification } = require("../middleware");
const auth = require("./auth");
const project = require("./project");
const task = require("./task");
const log = require("./log");
const router = express.Router();

router.use("/auth", auth);

router.use(tokenVerification); // Middleware xác thực token cho các route phía dưới
router.use("/project", project);
router.use("/task", task);
router.use("/log", log);

module.exports = router;