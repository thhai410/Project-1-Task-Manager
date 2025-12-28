const Joi = require("joi");
const mongoose = require("mongoose");

// 1. IMPORT SCHEMA
const logSchema = require("../../../models/log/log-schema");

// 2. ĐĂNG KÝ MODEL
const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

// 3. VALIDATION SCHEMA
const schema = Joi.object({
  logId: Joi.string().required().length(24).messages({
    "string.length": "Log ID không hợp lệ",
    "any.required": "Thiếu Log ID"
  }),
  // Các trường cho phép update
  title: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("").optional(),
  worked_time: Joi.number().min(0).optional(), // Không được nhập số âm
});

const updateLog = async (req, res) => {
  try {
    // 1. Auth Check
    if (!req.userId) {
      return res.status(401).send({ status: "FAILED", message: "Unauthorized" });
    }

    // 2. Validate Input
    const params = await schema.validateAsync(req.body);
    const { logId, ...updateData } = params;

    // Kiểm tra xem có dữ liệu update không
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ status: "FAILED", message: "Bạn chưa gửi thông tin cần cập nhật" });
    }

    // 3. Tìm và Update
    // ĐIỀU KIỆN QUAN TRỌNG: _id khớp LogID VÀ user_id khớp với người đang request
    const updatedLog = await Log.findOneAndUpdate(
      { 
        _id: logId, 
        user_id: req.userId 
      },
      { 
        $set: updateData 
        // Vì schema bạn dùng { timestamps: true } nên updatedAt tự nhảy, không cần set tay
      },
      { new: true } // Trả về data mới
    );

    // 4. Xử lý kết quả
    if (!updatedLog) {
      return res.status(404).send({
        status: "FAILED",
        message: "Cập nhật thất bại (Log không tồn tại hoặc bạn không phải người tạo log này).",
      });
    }

    return res.status(200).send({
      status: "SUCCESS",
      message: "Cập nhật log thành công!",
      data: updatedLog,
    });

  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = updateLog;