// Giả định đường dẫn tới model Project
const Project = require("../../../models/project"); 

// Lưu ý: Đối với DELETE, chúng ta thường chỉ cần validate project_id từ params
// không cần Joi schema phức tạp cho body

const deleteProject = async (req, res) => {
  try {
    // 1. Kiểm tra User từ Token (Giả sử middleware auth đã chạy trước đó)
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized: Bạn cần đăng nhập để thực hiện chức năng này!",
      });
    }

    // 2. Lấy ID dự án từ URL parameters
    const projectId = req.query.project_id;
    if (!projectId) {
      return res.status(400).send({
        status: "FAILED",
        message: "Yêu cầu phải cung cấp Project ID.",
      });
    }
    
    // 3. Tìm dự án và kiểm tra quyền sở hữu
    // Chúng ta dùng findOneAndDelete để tìm và xóa trong một thao tác
    const deletedProject = await Project.findOneAndDelete({
      _id: projectId, // Tìm theo ID dự án
      owner_id: req.userId, // CHỈ xóa nếu người dùng hiện tại là owner
    });

    // 4. Kiểm tra kết quả xóa
    if (!deletedProject) {
      // Nếu không tìm thấy hoặc người dùng không phải là owner
      const projectExists = await Project.exists({ _id: projectId });
      
      if (!projectExists) {
        // Dự án không tồn tại
        return res.status(404).send({
          status: "FAILED",
          message: "Dự án không tồn tại hoặc đã bị xóa.",
        });
      } else {
        // Dự án tồn tại nhưng người dùng không phải là owner
        return res.status(403).send({
          status: "FAILED",
          message: "Forbidden: Bạn không có quyền xóa dự án này (chỉ Owner mới có thể xóa).",
        });
      }
    }

    // 5. Trả về kết quả thành công
    return res.status(200).send({
      status: "SUCCESS",
      message: `Dự án '${deletedProject.name}' đã được xóa thành công!`,
      data: {
        _id: deletedProject._id,
      },
    });

  } catch (e) {
    // Xử lý lỗi server (ví dụ: lỗi kết nối DB, định dạng ID không hợp lệ)
    // Nếu ID không hợp lệ (ví dụ: không phải định dạng MongoDB ObjectId)
    if (e.name === 'CastError') {
       return res.status(400).send({
          status: "FAILED",
          message: "Project ID không hợp lệ.",
      });
    }
    
    return res.status(500).send({
      status: "FAILED",
      message: `Lỗi Server: ${e.message}`,
    });
  }
};

module.exports = deleteProject;