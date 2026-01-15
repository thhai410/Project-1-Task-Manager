const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA (Theo đúng đường dẫn như file get-tasks của bạn)
const taskSchema = require("../../../models/task/task-schema");
const userSchema = require("../../../models/user/user-schema");
const projectSchema = require("../../../models/project/project-schema");
// Project schema cần thiết nếu bạn muốn validate hoặc populate project sau này
// const projectSchema = require("../../../models/project/project-schema"); 

// 2. ĐĂNG KÝ MODEL (BẮT BUỘC để tránh lỗi Schema hasn't been registered)
// Logic: Nếu Model đã có thì dùng, chưa có thì tạo mới từ Schema
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

// Đăng ký Model User để dùng cho populate khi trả về task đã update
if (!mongoose.models.User) {
  mongoose.model("User", userSchema);
}

// Helper function to calculate project progress
const calculateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project_id: projectId });
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
  return Math.round(totalProgress / tasks.length);
};

// 3. VALIDATION SCHEMA (Validate req.body - dữ liệu gửi lên để sửa)
// Tất cả các trường đều là .optional() vì người dùng có thể chỉ sửa 1 trường (VD: chỉ đổi status)
const schema = Joi.object({
  title: Joi.string().trim().optional(),
  des: Joi.string().allow("").optional(),
  
  // Validate ngày tháng (tùy logic, có thể cho phép lùi ngày hoặc không)
  due_date: Joi.date().optional(),
  
  estimate_time: Joi.number().optional(),
  worked_time: Joi.number().optional(),
  progress: Joi.number().min(0).max(100).optional().messages({
    "number.min": "Tiến độ phải >= 0",
    "number.max": "Tiến độ phải <= 100"
  }),
  
  // Validate Enum giống như trong Schema
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  status: Joi.string().valid("Not Started", "In Progress", "Completed").optional(),
  
  assignee_id: Joi.string().trim().optional().messages({
    "string.base": "ID người thực hiện phải là chuỗi"
  }),
});

const updateTask = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Lấy ID task từ URL (req.params)
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        status: "FAILED",
        message: "Thiếu ID của task cần cập nhật",
      });
    }

    // 3. Validate dữ liệu gửi lên (req.body)
    const validated = await schema.validateAsync(req.body);

    // 4. Tìm và Cập nhật Task
    // - { new: true }: Trả về data mới sau khi update (mặc định mongo trả về data cũ)
    // - { runValidators: true }: Bắt buộc check lại Enum (VD: gửi status="ABC" sẽ lỗi ngay)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...validated },
      { new: true, runValidators: true }
    )
    // Populate luôn để Frontend cập nhật lại giao diện (VD: hiện avatar người mới được assign)
    .populate("assignee_id", "name email user_name role");

    // 5. Kiểm tra nếu không tìm thấy task
    if (!updatedTask) {
      return res.status(404).send({
        status: "FAILED",
        message: "Không tìm thấy task hoặc ID không hợp lệ!",
      });
    }

    // 6. Automatically update project progress if task progress was updated
    if (validated.progress !== undefined && updatedTask.project_id) {
      const projectProgress = await calculateProjectProgress(updatedTask.project_id);
      await Project.findByIdAndUpdate(
        updatedTask.project_id,
        { progress: projectProgress },
        { new: true }
      );
    }

    // 7. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Cập nhật task thành công!",
      data: updatedTask,
    });

  } catch (e) {
    // Xử lý lỗi (VD: sai format ID, sai Enum status...)
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = updateTask;