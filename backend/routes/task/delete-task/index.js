// Giả định đường dẫn tới model Task
const Task = require("../../../models/task");

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

    // 3. Thực hiện xóa Task
    // Lưu ý: Ở đây ta dùng findByIdAndDelete để tìm và xóa theo ID.
    // Nếu bạn muốn kiểm tra quyền (ví dụ: chỉ người tạo hoặc admin mới được xóa),
    // bạn cần logic phức tạp hơn (tìm task -> check project/owner -> xóa).
    // Ở mức cơ bản, ta cho phép xóa nếu có ID hợp lệ.
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // 4. Kiểm tra kết quả
    if (!deletedTask) {
      return res.status(404).send({
        status: "FAILED",
        message: "Task không tồn tại hoặc đã bị xóa.",
      });
    }

    // 5. Trả về kết quả thành công
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