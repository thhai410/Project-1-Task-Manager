const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA
const projectSchema = require("../../../models/project/project-schema");
const userSchema = require("../../../models/user/user-schema");

// 2. ĐĂNG KÝ MODEL
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

// 3. VALIDATION SCHEMA
// Chỉ cần validate projectId gửi lên từ query hoặc params
const schema = Joi.object({
  projectId: Joi.string().required().length(24).messages({
    "string.length": "Project ID không hợp lệ (phải 24 ký tự)",
    "any.required": "Thiếu Project ID"
  }),
});

const getProjectDetail = async (req, res) => {
  try {
    // 1. Auth Check
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập!",
      });
    }

    // 2. Validate Input
    // Giả sử bạn gửi projectId qua query parameter: /api/project/get-detail?projectId=...
    const { projectId } = await schema.validateAsync(req.query);

    // 3. Tìm dự án & Kiểm tra quyền truy cập cùng lúc
    // Logic: Tìm dự án có ID này VÀ (là Owner HOẶC là Member)
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner_id: req.userId },
        { "members.user_id": req.userId }
      ]
    })
    // Populate sâu hơn nếu cần (ví dụ lấy cả avatar nếu có)
    .populate("owner_id", "name email user_name")
    .populate("members.user_id", "name email user_name");

    // 4. Xử lý kết quả
    if (!project) {
      // Nếu không tìm thấy, có thể do Project không tồn tại 
      // HOẶC User không có quyền truy cập (do điều kiện $or ở trên chặn lại)
      return res.status(404).send({
        status: "FAILED",
        message: "Dự án không tồn tại hoặc bạn không có quyền truy cập.",
      });
    }

    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy chi tiết dự án thành công!",
      data: project,
    });

  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = getProjectDetail;