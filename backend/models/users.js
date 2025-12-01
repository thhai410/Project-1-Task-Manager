import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  // tên: kiểu dữ liệu string, bắt buộc phải có
  name: {
    type: String,
    required: true
  },
  // email: kiểu dữ liệu string, bắt buộc phải có, duy nhất
  email: {
    type: String,
    required: true,
    unique: true
  },
  // mật khẩu: kiểu dữ liệu string, bắt buộc phải có, độ dài tối thiểu 6 ký tự
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // vai trò: kiểu dữ liệu string, có thể là "admin", "pm" hoặc "member", mặc định là "member"
  role: {
    type: String,
    enum: ["admin", "pm", "member"],
    default: "member"
  },
  // ảnh đại diện: kiểu dữ liệu string, mặc định là chuỗi rỗng, có thể lưu ảnh URL
  avatar: {
    type: String,
    default: ""
  },
  // phòng ban: kiểu dữ liệu string
  department: {
    type: String,
  },
  // trạng thái hoạt động: kiểu dữ liệu boolean, mặc định là true
  isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

// Mã hóa mật khẩu trước khi lưu người dùng
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashed = await bcrypt.hash(this.password, 10);
  this.password = hashed;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);