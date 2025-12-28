const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA
const logSchema = require("../../../models/log/log-schema");
const userSchema = require("../../../models/user/user-schema");
const taskSchema = require("../../../models/task/task-schema"); // Import thêm Task để populate nếu cần

// 2. ĐĂNG KÝ MODEL
const Log = mongoose.models.Log || mongoose.model("Log", logSchema);
if (!mongoose.models.User) mongoose.model("User", userSchema);
if (!mongoose.models.Task) mongoose.model("Task", taskSchema);

// 3. VALIDATION SCHEMA (Query Params)
const schema = Joi.object({
  taskId: Joi.string().length(24).optional(), // Lọc log theo Task
  userId: Joi.string().length(24).optional(), // Lọc log theo người làm
  // Có thể thêm lọc theo ngày tháng nếu cần (startDate, endDate) sau này
});

const getLogs = async (req, res) => {
  try {
    // 1. Auth Check
    if (!req.userId) {
      return res.status(401).send({ status: "FAILED", message: "Unauthorized" });
    }

    // 2. Validate Query
    const queryParams = await schema.validateAsync(req.query);

    // 3. Xây dựng điều kiện lọc
    let condition = {};

    // Nếu có taskId -> Lấy log của task đó
    if (queryParams.taskId) {
      condition.task_id = queryParams.taskId;
    }

    // Nếu có userId -> Lấy log của user đó (Nếu không truyền thì lấy tất cả mọi người)
    if (queryParams.userId) {
      condition.user_id = queryParams.userId;
    }

    // *Mặc định: Nếu không truyền gì cả, có thể trả về logs của chính user đang login (My Logs)
    // hoặc trả về rỗng tùy nghiệp vụ. Ở đây mình để logic mở:
    // Nếu không có taskId, thì tự động lấy log của chính user đang login (Dashboard cá nhân)
    if (!queryParams.taskId && !queryParams.userId) {
        condition.user_id = req.userId;
    }

    // 4. Query Database
    const logs = await Log.find(condition)
      .populate("user_id", "name email user_name") // Lấy thông tin người log
      .populate("task_id", "title status")         // Lấy tên task (hữu ích khi xem ở Dashboard tổng)
      .sort({ created_date: -1 });                 // Mới nhất lên đầu

    // 5. Tính tổng thời gian (Bonus Feature)
    // Giúp Frontend không phải for loop để tính
    const totalTime = logs.reduce((acc, curr) => acc + (curr.worked_time || 0), 0);

    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách log thành công!",
      data: logs,
      meta: {
        count: logs.length,
        total_worked_time: totalTime // Trả về tổng giờ làm
      }
    });

  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = getLogs;