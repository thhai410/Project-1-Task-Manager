const Joi = require("joi");
// Giả định đường dẫn tới model Project, bạn hãy điều chỉnh lại cho đúng cấu trúc folder của bạn
const Project = require("../../../models/project"); 

// Validation schema cho dữ liệu gửi lên
const schema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.empty": "Tên dự án không được để trống",
    "any.required": "Tên dự án là bắt buộc"
  }),
  description: Joi.string().allow(""),
  title: Joi.string().allow(""),
  description_detail: Joi.string().allow(""),
  due_date: Joi.date().optional().messages({
    "date.base": "Ngày hết hạn phải là ngày hợp lệ"
  }),
  document: Joi.string().allow(""),
  progress: Joi.number().min(0).max(100).optional(),
  // Các trường như status, progress, owner_id không cần validate từ body vì sẽ set mặc định hoặc lấy từ token
});

const addProject = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token (Giả sử middleware auth đã chạy trước đó)
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Validate input từ body
    const validated = await schema.validateAsync(req.body);

    // 3. Tạo instance Project mới
    // Lưu ý: project_id sẽ tự động được tạo bởi hàm default trong schema
    const newProject = new Project({
      ...validated,
      owner_id: req.userId, // Lấy ID người tạo làm owner
      members: [
        {
          // Tự động thêm người tạo vào danh sách thành viên với vai trò admin
          user_id: req.userId,
          role: "admin",
          joined_at: new Date(),
        },
      ],
      // Các trường default khác (progress, status, created_date) sẽ tự động được set bởi Mongoose
    });

    // 4. Lưu vào database
    await newProject.save();

    // 5. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Tạo dự án thành công!",
      data: newProject,
    });

  } catch (e) {
    // Xử lý lỗi validation của Joi hoặc lỗi server
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = addProject;