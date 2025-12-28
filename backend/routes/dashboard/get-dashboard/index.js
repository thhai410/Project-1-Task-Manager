const mongoose = require("mongoose");

// IMPORT SCHEMA
const Project = mongoose.models.Project || mongoose.model(
  "Project",
  require("../../models/project/project-schema")
);

const Task = mongoose.models.Task || mongoose.model(
  "Task",
  require("../../models/task/task-schema")
);

const getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Auth
    if (!req.userId) {
      return res.status(401).send({
        status: "FAILED",
        message: "Unauthorized"
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    // 2️⃣ Lấy project user tham gia
    const myProjects = await Project.find({
      $or: [
        { owner_id: userId },
        { "members.user_id": userId }
      ]
    }).select("_id members");

    const projectIds = myProjects.map(p => p._id);

    // ❗ Nếu user chưa thuộc project nào
    if (projectIds.length === 0) {
      return res.status(200).send({
        status: "SUCCESS",
        data: {
          overdue_tasks: [],
          tasks_per_member: []
        }
      });
    }

    // 3️⃣ QUERY SONG SONG
    const [overdueTasks, tasksPerMember] = await Promise.all([

      // A. TASK QUÁ HẠN
      Task.find({
        project_id: { $in: projectIds },
        status: { $ne: "Completed" },
        due_date: { $lt: new Date() }
      })
      .select("title due_date status assignee_id project_id")
      .populate("assignee_id", "name email"),

      // B. TASK PER MEMBER
      Task.aggregate([
        {
          $match: {
            project_id: { $in: projectIds },
            assignee_id: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$assignee_id",
            total_tasks: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            user_id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            total_tasks: 1
          }
        }
      ])
    ]);

    // 4️⃣ RESPONSE
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy dashboard thành công!",
      data: {
        overdue_tasks: overdueTasks,
        tasks_per_member: tasksPerMember
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "FAILED",
      message: error.message
    });
  }
};

module.exports = getDashboardStats;
