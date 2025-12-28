const Joi = require("joi");
// Giả định đường dẫn tới model Task, bạn hãy điều chỉnh lại cho đúng cấu trúc folder của bạn
const Task = require("../../../models/task");

// Validation schema cho dữ liệu gửi lên
const schema = Joi.object({
  project_id: Joi.string().required().trim().messages({
    "string.empty": "ID dự án không được để trống",
    "any.required": "ID dự án là bắt buộc"
  }),
  title: Joi.string().required().trim().messages({
    "string.empty": "Tiêu đề task không được để trống",
    "any.required": "Tiêu đề task là bắt buộc"
  }),
  des: Joi.string().allow(""),
  due_date: Joi.date().greater("now").optional().messages({
    "date.greater": "Ngày hết hạn phải lớn hơn ngày hiện tại"
  }),
  estimate_time: Joi.number().optional().messages({
    "number.base": "Thời gian ước tính phải là số"
  }),
  worked_time: Joi.number().optional().messages({
    "number.base": "Thời gian đã làm phải là số"
  }),
  priority: Joi.string().valid("Low", "Medium", "High").optional().messages({
    "any.only": "Ưu tiên phải là một trong: Low, Medium, High"
  }),
  assignee_id: Joi.string().optional().trim().messages({
    "string.base": "ID người thực hiện phải là chuỗi"
  }),
  status: Joi.string().valid("Not Started", "In Progress", "Completed").optional().messages({
    "any.only": "Trạng thái phải là một trong: Not Started, In Progress, Completed"
  })
});

const addTask = async (req, res) => {
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

    // 3. Tạo instance Task mới
    // Lưu ý: Các trường default như status, created_date, worked_time (nếu không có) sẽ tự động được set bởi Mongoose
    const newTask = new Task({
      ...validated,
    });

    // 4. Lưu vào database
    await newTask.save();

    // 5. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Tạo task thành công!",
      data: newTask,
    });

  } catch (e) {
    // Xử lý lỗi validation của Joi hoặc lỗi server
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = addTask;