const mongoose = require("mongoose");

// IMPORT SCHEMA
const Log = mongoose.models.Log || mongoose.model(
  "Log",
  require("../../../models/log/log-schema")
);

const userSchema = require("../../../models/user/user-schema");
const taskSchema = require("../../../models/task/task-schema");

// Đăng ký Model User và Task để dùng cho populate
if (!mongoose.models.User) {
  mongoose.model("User", userSchema);
}
if (!mongoose.models.Task) {
  mongoose.model("Task", taskSchema);
}

const getAllLogs = async (req, res) => {
  try {
    // 1️⃣ Check admin role
    if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).send({
        status: "FAILED",
        message: "Access denied. Admin role required."
      });
    }

    // 2️⃣ Get all logs (no filtering for admin)
    const logs = await Log.find({})
      .populate("user_id", "name email user_name")
      .populate("task_id", "title status")
      .sort({ created_date: -1 })
      .limit(50); // Limit to recent 50 logs

    // 3️⃣ Calculate total worked time
    const totalTime = logs.reduce((acc, curr) => acc + (curr.worked_time || 0), 0);

    // 4️⃣ Response
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách logs thành công!",
      data: logs,
      meta: {
        count: logs.length,
        total_worked_time: totalTime
      }
    });

  } catch (error) {
    console.error("Error getting all logs:", error);
    return res.status(500).send({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

module.exports = getAllLogs;

