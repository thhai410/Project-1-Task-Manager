const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA
const projectSchema = require("../../../models/project/project-schema");
const userSchema = require("../../../models/user/user-schema");

// 2. ĐĂNG KÝ MODEL
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

// Đăng ký model User (lưu ý chữ thường "user" để khớp với ref trong Project Schema)
const User = mongoose.models.user || mongoose.model("user", userSchema);

// 3. VALIDATION SCHEMA
const schema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Vui lòng nhập email thành viên cần thêm"
  }),
  role: Joi.string().valid("admin", "member").default("member").optional(),
});

const addMember = async (req, res) => {
  try {
    // 1. Check Auth
    if (!req.userId) {
      return res.status(401).send({ status: "FAILED", message: "Unauthorized" });
    }

    // 2. Lấy Project ID từ URL
    const { id } = req.params;
    if (!id) return res.status(400).send({ status: "FAILED", message: "Thiếu ID dự án" });

    // 3. Validate Email gửi lên
    const { email, role } = await schema.validateAsync(req.body);

    // 4. Tìm Dự án
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).send({ status: "FAILED", message: "Dự án không tồn tại" });
    }

    // 5. CHECK QUYỀN: Chỉ Owner mới được thêm thành viên
    // Lưu ý: project.owner_id là ObjectId, req.userId là String -> Cần ép kiểu hoặc so sánh String
    if (project.owner_id.toString() !== req.userId) {
      return res.status(403).send({ 
        status: "FAILED", 
        message: "Bạn không phải chủ dự án này nên không có quyền thêm thành viên!" 
      });
    }

    // 6. Tìm User cần thêm qua Email
    const userToAdd = await User.findOne({ email: email });
    if (!userToAdd) {
      return res.status(404).send({ 
        status: "FAILED", 
        message: `Không tìm thấy người dùng nào có email: ${email}` 
      });
    }

    // 7. Kiểm tra User đó đã trong dự án chưa?
    // Dùng hàm .some() để quét mảng members
    const isExist = project.members.some(
      (member) => member.user_id.toString() === userToAdd._id.toString()
    );

    if (isExist) {
      return res.status(400).send({ 
        status: "FAILED", 
        message: "Thành viên này đã có trong dự án rồi!" 
      });
    }
    
    // Kiểm tra luôn nếu add chính ông Owner vào (trường hợp hiếm nhưng nên chặn)
    if (userToAdd._id.toString() === project.owner_id.toString()) {
        return res.status(400).send({ status: "FAILED", message: "Bạn là chủ dự án rồi, không cần tự thêm mình!" });
    }

    // 8. Thêm vào mảng members
    project.members.push({
      user_id: userToAdd._id,
      role: role || "member",
      joined_at: new Date()
    });

    await project.save();

    // 9. Trả về kết quả (Có thể populate để hiện tên người vừa add luôn)
    // Populate user_id trong mảng members để lấy tên
    await project.populate("members.user_id", "name email user_name");

    return res.status(200).send({
      status: "SUCCESS",
      message: "Thêm thành viên thành công!",
      data: project,
    });

  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = addMember;