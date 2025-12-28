const mongoose = require("mongoose");

// IMPORT SCHEMA
const Project = mongoose.models.Project || mongoose.model(
  "Project",
  require("../../../models/project/project-schema")
);

const userSchema = require("../../../models/user/user-schema");

// Đăng ký Model User để dùng cho populate
if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

const getAllProjects = async (req, res) => {
  try {
    // 1️⃣ Check admin role
    if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).send({
        status: "FAILED",
        message: "Access denied. Admin role required."
      });
    }

    // 2️⃣ Get all projects (no filtering for admin)
    const projects = await Project.find({})
      .populate("owner_id", "name email user_name")
      .populate("members.user_id", "name email user_name")
      .sort({ created_date: -1 });

    // 3️⃣ Response
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách projects thành công!",
      data: projects,
      count: projects.length
    });

  } catch (error) {
    console.error("Error getting all projects:", error);
    return res.status(500).send({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

module.exports = getAllProjects;

