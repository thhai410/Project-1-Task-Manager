const mongoose = require("mongoose");

// IMPORT SCHEMA
const User = mongoose.models.User || mongoose.model(
  "user",
  require("../../../models/user/user-schema")
);

const getAllUsers = async (req, res) => {
  try {
    // 1️⃣ Check admin role
    if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).send({
        status: "FAILED",
        message: "Access denied. Admin role required."
      });
    }

    // 2️⃣ Get all users (exclude password)
    const users = await User.find({})
      .select("-password") // Exclude password from response
      .sort({ created_date: -1 });

    // 3️⃣ Response
    return res.status(200).send({
      status: "SUCCESS",
      message: "Lấy danh sách users thành công!",
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).send({
      status: "FAILED",
      message: "Internal server error"
    });
  }
};

module.exports = getAllUsers;

