const mongoose = require("mongoose");

// IMPORT SCHEMA
const Task = mongoose.models.Task || mongoose.model(
  "Task",
  require("../../../models/task/task-schema")
);

const userSchema = require("../../../models/user/user-schema");
const projectSchema = require("../../../models/project/project-schema");

// Đăng ký Model User và Project để dùng cho populate
if (!mongoose.models.User) {
  mongoose.model("User", userSchema);
}
if (!mongoose.models.Project) {
  mongoose.model("Project", projectSchema);
}

const getAllTasks = async (req, res) => {
  try {
    // 1️⃣ Check admin role
    if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).send({
        status: "FAILED",
        message: "Access denied. Admin role required."
      });
    }

    // 2️⃣ Get all tasks (no filtering for admin)
    const tasks = await Task.find({})
      .populate("assignee_id", "name email user_name role")
      .populate("project_id", "name title")
      .sort({ created_date: -1 });

    // 3️⃣ Response
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách tasks thành công!",
      data: tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error("Error getting all tasks:", error);
    return res.status(500).send({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

module.exports = getAllTasks;

