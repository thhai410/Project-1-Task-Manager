const Joi = require("joi");
// Giả định đường dẫn tới model Log và Task
const Log = require("../../../models/log");
const Task = require("../../../models/task"); 

// Validation schema cho dữ liệu gửi lên
const schema = Joi.object({
  task_id: Joi.string().required().trim().messages({
    "string.empty": "ID công việc (Task) không được để trống",
    "any.required": "ID công việc (Task) là bắt buộc"
  }),
  title: Joi.string().required().trim().messages({
    "string.empty": "Tiêu đề log không được để trống",
    "any.required": "Tiêu đề log là bắt buộc"
  }),
  description: Joi.string().allow(""),
  worked_time: Joi.number().min(0).optional().messages({
    "number.base": "Thời gian làm việc phải là số",
    "number.min": "Thời gian làm việc không được nhỏ hơn 0"
  }),
  // user_id sẽ lấy từ token, created_date lấy mặc định hiện tại
});

const addLog = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token (Auth Middleware)
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Validate input từ body
    const validated = await schema.validateAsync(req.body);

    // 3. (QUAN TRỌNG) Kiểm tra xem Task có tồn tại không?
    // Không thể log thời gian cho một task "ma" được.
    const taskExists = await Task.findById(validated.task_id);
    if (!taskExists) {
      return res.status(404).send({
        status: "FAILED",
        message: "Task không tồn tại hoặc đã bị xóa.",
      });
    }

    // 4. Tạo instance Log mới
    const newLog = new Log({
      ...validated,
      user_id: req.userId, // Lấy ID người đang login làm người tạo log
    });

    // 5. Lưu Log vào database
    await newLog.save();

    // --- (TÙY CHỌN NÂNG CAO) ---
    // Thường thì khi log time, ta sẽ cộng dồn vào worked_time của Task cha.
    // Nếu bạn muốn tính năng này, hãy bỏ comment đoạn dưới đây:
    /*
    if (validated.worked_time && validated.worked_time > 0) {
        taskExists.worked_time = (taskExists.worked_time || 0) + validated.worked_time;
        await taskExists.save();
    }
    */
    // ---------------------------

    // 6. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Thêm log công việc thành công!",
      data: newLog,
    });

  } catch (e) {
    // Xử lý lỗi validation của Joi hoặc lỗi server
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = addLog;