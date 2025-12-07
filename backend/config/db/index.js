const mongoose = require("mongoose");
require("dotenv").config();
const connect = async () => {
  try {
    // sử dụng process.env.MONGODB_URI
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/task-manager";
    await mongoose.connect(uri);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

module.exports = connect;

