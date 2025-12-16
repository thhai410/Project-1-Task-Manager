// Giả định đường dẫn tới model Log
const Log = require("../../../models/log");
// Nếu bạn muốn trừ lại thời gian trong Task, hãy uncomment dòng dưới
// const Task = require("../../../models/task");

const deleteLog = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Lấy ID log từ URL parameters
    const logId = req.query.log_id;
    if (!logId) {
      return res.status(400).send({
        status: "FAILED",
        message: "Yêu cầu phải cung cấp Log ID.",
      });
    }

    // 3. Tìm và xóa Log
    // Điều kiện: ID phải khớp VÀ user_id phải trùng với người đang request (Owner)
    const deletedLog = await Log.findOneAndDelete({
      _id: logId,
      user_id: req.userId, 
    });

    // 4. Kiểm tra kết quả
    if (!deletedLog) {
      // Nếu không xóa được, có thể do Log không tồn tại HOẶC không phải chính chủ
      const logExists = await Log.exists({ _id: logId });
      
      if (!logExists) {
        return res.status(404).send({
          status: "FAILED",
          message: "Log không tồn tại hoặc đã bị xóa.",
        });
      } else {
        return res.status(403).send({
          status: "FAILED",
          message: "Forbidden: Bạn không có quyền xóa Log của người khác.",
        });
      }
    }

    // --- (TÙY CHỌN NÂNG CAO: Trừ lại thời gian làm việc cho Task) ---
    // Nếu lúc Add Log bạn đã cộng thời gian, thì lúc Xóa Log bạn nên trừ đi
    /*
    if (deletedLog.worked_time > 0) {
       await Task.findByIdAndUpdate(deletedLog.task_id, {
         $inc: { worked_time: -deletedLog.worked_time }
       });
    }
    */
    // ----------------------------------------------------------------

    // 5. Trả về kết quả
    return res.status(200).send({
      status: "SUCCESS",
      message: "Đã xóa log thành công!",
      data: {
        _id: deletedLog._id,
        task_id: deletedLog.task_id
      },
    });

  } catch (e) {
    if (e.name === 'CastError') {
       return res.status(400).send({
          status: "FAILED",
          message: "Log ID không hợp lệ.",
      });
    }
    return res.status(500).send({
      status: "FAILED",
      message: `Lỗi Server: ${e.message}`,
    });
  }
};

module.exports = deleteLog;