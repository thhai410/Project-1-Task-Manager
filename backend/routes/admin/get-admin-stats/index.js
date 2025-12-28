const mongoose = require("mongoose");

// IMPORT SCHEMA
const User = mongoose.models.User || mongoose.model(
  "user",
  require("../../../models/user/user-schema")
);

const Project = mongoose.models.Project || mongoose.model(
  "Project",
  require("../../../models/project/project-schema")
);

const Task = mongoose.models.Task || mongoose.model(
  "Task",
  require("../../../models/task/task-schema")
);

const getAdminStats = async (req, res) => {
  try {
    // 1️⃣ Check admin role
    if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).send({
        status: "FAILED",
        message: "Access denied. Admin role required."
      });
    }

    // 2️⃣ QUERY SONG SONG - Lấy tất cả thống kê
    const [totalUsers, totalProjects, totalTasks, taskStats] = await Promise.all([
      // A. Tổng số users
      User.countDocuments(),

      // B. Tổng số projects
      Project.countDocuments(),

      // C. Tổng số tasks
      Task.countDocuments(),

      // D. Task stats (active/completed)
      Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // 3️⃣ Process task stats
    const taskStatusMap = {};
    taskStats.forEach(stat => {
      taskStatusMap[stat._id] = stat.count;
    });

    const activeTasks = (taskStatusMap['Not Started'] || 0) + (taskStatusMap['In Progress'] || 0);
    const completedTasks = taskStatusMap['Completed'] || 0;

    // 4️⃣ Response
    return res.status(200).send({
      status: "SUCCESS",
      data: {
        totalUsers,
        totalProjects,
        totalTasks,
        activeTasks,
        completedTasks
      }
    });

  } catch (error) {
    console.error("Error getting admin stats:", error);
    return res.status(500).send({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

module.exports = getAdminStats;