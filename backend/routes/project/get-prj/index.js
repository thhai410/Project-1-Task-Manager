const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA
const projectSchema = require("../../../models/project/project-schema");
const userSchema = require("../../../models/user/user-schema");

// 2. ĐĂNG KÝ MODEL
// Kiểm tra: Nếu Model "Project" chưa có thì tạo mới
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

// Đăng ký Model User để dùng cho populate
// LƯU Ý: Trong projectSchema bạn để ref: "user" (chữ thường), nên ở đây phải đăng ký "user"
if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

// 3. VALIDATION SCHEMA (Validate params trên URL)
const schema = Joi.object({
  status: Joi.string().valid("Not Started", "In Progress", "Completed").optional(),
  keyword: Joi.string().allow("").optional(), // Để tìm kiếm theo tên dự án
});

const getProjects = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Validate dữ liệu từ URL (req.query)
    const queryParams = await schema.validateAsync(req.query);

    // 3. Xây dựng bộ lọc (Query Builder)
    // LOGIC QUAN TRỌNG: User chỉ thấy dự án nếu là Owner HOẶC là Member
    let condition = {
      $or: [
        { owner_id: req.userId },          // Trường hợp 1: Là chủ dự án
        { "members.user_id": req.userId }  // Trường hợp 2: Có trong mảng members
      ]
    };

    // Tìm kiếm tương đối theo Tên dự án (name) hoặc Tiêu đề (title)
    if (queryParams.keyword) {
      // Dùng $and để đảm bảo tìm kiếm nhưng vẫn phải nằm trong danh sách dự án của mình
      condition.$and = [
        {
          $or: [
             { name: { $regex: queryParams.keyword, $options: "i" } },
             { title: { $regex: queryParams.keyword, $options: "i" } }
          ]
        }
      ];
    }

    // Lọc theo trạng thái
    if (queryParams.status) {
      condition.status = queryParams.status;
    }

    // 4. Truy vấn Database
    const projects = await Project.find(condition)
      // Populate thông tin Owner (Lấy tên, email, username)
      .populate("owner_id", "name email user_name")
      // Populate thông tin Members (Lấy thông tin chi tiết của các thành viên trong mảng)
      .populate("members.user_id", "name email user_name") 
      .sort({ created_date: -1 }); // Sắp xếp mới nhất lên đầu

    // 5. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách dự án thành công!",
      data: projects,
      count: projects.length // Trả về số lượng
    });

  } catch (e) {
    // Xử lý lỗi
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = getProjects;