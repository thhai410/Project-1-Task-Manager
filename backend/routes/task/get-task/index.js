const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA (Vì cấu trúc project của bạn export Schema chứ không phải Model)
const taskSchema = require("../../../models/task/task-schema");
const userSchema = require("../../../models/user/user-schema");
const projectSchema = require("../../../models/project/project-schema");

// 2. ĐĂNG KÝ MODEL (Bước này BẮT BUỘC để fix lỗi populate)
// Kiểm tra: Nếu Model "Task" chưa có thì tạo mới, nếu có rồi thì dùng lại
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Đăng ký Model User để dùng cho populate (lấy thông tin người được giao việc)
if (!mongoose.models.User) {
  mongoose.model("User", userSchema);
}
if (!mongoose.models.Project) { 
    mongoose.model("Project", projectSchema); 
}


// 3. VALIDATION SCHEMA (Validate params trên URL)
const schema = Joi.object({
  project_id: Joi.string().trim().optional().messages({
    "string.base": "ID dự án phải là chuỗi"
  }),
  assignee_id: Joi.string().trim().optional().messages({
    "string.base": "ID người thực hiện phải là chuỗi"
  }),
  status: Joi.string().valid("Not Started", "In Progress", "Completed").optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  progressMin: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Progress min phải là số"
  }),
  progressMax: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Progress max phải là số"
  }),
  keyword: Joi.string().allow("").optional(), // Để tìm kiếm theo title
});

const getTasks = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Validate dữ liệu từ URL (req.query)
    // Lưu ý: GET request dùng req.query, không dùng req.body
    const queryParams = await schema.validateAsync(req.query);

    // 3. Xây dựng bộ lọc (Query Builder)
    let condition = {};

    // Lọc theo dự án
    if (queryParams.project_id) {
      condition.project_id = queryParams.project_id;
    }

    // Lọc theo người làm
    if (queryParams.assignee_id) {
      condition.assignee_id = queryParams.assignee_id;
    }

    // Lọc theo trạng thái và ưu tiên
    if (queryParams.status) condition.status = queryParams.status;
    if (queryParams.priority) condition.priority = queryParams.priority;

    // Lọc theo tiến độ (progress)
    if (queryParams.progressMin !== undefined || queryParams.progressMax !== undefined) {
      condition.progress = {};
      if (queryParams.progressMin !== undefined) {
        condition.progress.$gte = queryParams.progressMin;
      }
      if (queryParams.progressMax !== undefined) {
        condition.progress.$lte = queryParams.progressMax;
      }
    }

    // Tìm kiếm tương đối (Like search) theo Title
    if (queryParams.keyword) {
      condition.title = { $regex: queryParams.keyword, $options: "i" };
    }

    // 4. Truy vấn Database
    const tasks = await Task.find(condition)
      // Populate để lấy thông tin chi tiết của người làm (User)
      // Mongoose sẽ tự tìm model "User" đã đăng ký ở trên để lấy name, email...
      .populate("assignee_id", "name email user_name role")
      // .populate("project_id", "title") // Mở dòng này nếu muốn lấy tên dự án
      .sort({ created_date: -1 }); // Sắp xếp mới nhất lên đầu

    // 5. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách task thành công!",
      data: tasks,
      count: tasks.length // Tiện cho việc hiển thị số lượng
    });

  } catch (e) {
    // Xử lý lỗi
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = getTasks;