const Joi = require("joi");
const mongoose = require("mongoose");
const projectSchema = require("../../../models/project/project-schema");

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

const schema = Joi.object({
  projectId: Joi.string().required().length(24),
  name: Joi.string().min(3).optional(),
  title: Joi.string().min(3).optional(),
  description: Joi.string().allow("").optional(),
  status: Joi.string().valid("Not Started", "In Progress", "Completed", "Archived").optional(),
  // User gửi lên là 'deadline' cho thuận tiện
  deadline: Joi.date().optional(),
});

const updateProject = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).send({ status: "FAILED", message: "Unauthorized" });
    }

    const params = await schema.validateAsync(req.body);
    const { projectId, ...updateData } = params;

    // --- FIX 1: MAP DỮ LIỆU ---
    // Nếu user gửi 'deadline', ta chuyển nó thành 'due_date' để khớp với Database
    if (updateData.deadline) {
      updateData.due_date = updateData.deadline;
      delete updateData.deadline; // Xóa field thừa đi để tránh lỗi schema
    }

    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        owner_id: req.userId
      },
      {
        $set: {
          ...updateData,
          updated_date: new Date()
        }
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).send({
        status: "FAILED",
        message: "Update thất bại (Sai ID hoặc không phải Owner).",
      });
    }

    return res.status(200).send({
      status: "SUCCESS",
      message: "Cập nhật dự án thành công!",
      data: updatedProject,
    });

  } catch (e) {
    return res.status(400).send({ status: "FAILED", message: e.message });
  }
};

module.exports = updateProject;