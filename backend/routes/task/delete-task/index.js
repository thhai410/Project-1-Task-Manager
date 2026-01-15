// Giả định đường dẫn tới model Task
const mongoose = require("mongoose");
const taskSchema = require("../../../models/task/task-schema");
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

const deleteTask = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token (Đảm bảo request đã qua middleware auth)
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Lấy ID task từ URL parameters
    const taskId = req.query.task_id;
    if (!taskId) {
      return res.status(400).send({
        status: "FAILED",
        message: "Yêu cầu phải cung cấp Task ID.",
      });
    }

    // 3. Tìm task trước khi xóa (để check quyền)
    const taskToDelete = await Task.findById(taskId);
    if (!taskToDelete) {
      return res.status(404).send({
        status: "FAILED",
        message: "Task không tồn tại hoặc đã bị xóa.",
      });
    }

    // 4. Kiểm tra authorization
    // - Admin có thể xóa bất kỳ task nào
    // - User thường chỉ xóa được task được assign cho mình hoặc task chưa được assign cho ai
    const isAdmin = req.role?.toLowerCase() === 'admin';
    const isAssignee = taskToDelete.assignee_id?.toString() === req.userId;
    const isUnassigned = !taskToDelete.assignee_id; // Task chưa được assign cho ai
    
    if (!isAdmin && !isAssignee && !isUnassigned) {
      return res.status(403).send({
        status: "FAILED",
        message: "Bạn không có quyền xóa task này. Chỉ người được giao việc, task chưa được assign, hoặc admin mới có thể xóa!",
      });
    }

    // 5. Thực hiện xóa Task
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // 6. Trả về kết quả thành công
    return res.status(200).send({
      status: "SUCCESS",
      message: `Đã xóa task: '${deletedTask.title}' thành công!`,
      data: {
        _id: deletedTask._id,
        project_id: deletedTask.project_id
      },
    });

  } catch (e) {
    // Xử lý lỗi (ví dụ: ID không đúng định dạng MongoDB)
    if (e.name === 'CastError') {
       return res.status(400).send({
          status: "FAILED",
          message: "Task ID không hợp lệ.",
      });
    }

    return res.status(500).send({
      status: "FAILED",
      message: `Lỗi Server: ${e.message}`,
    });
  }
};

module.exports = deleteTask;