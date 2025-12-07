const mongoose = require("mongoose");
const schemaType = require("../../types");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: schemaType.TypeString,
      required: true,
      trim: true,
    },

    username: {
      type: schemaType.TypeString,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: schemaType.TypeString,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    address: {
      type: schemaType.TypeString,
      default: "",
    },

    info: {
      type: schemaType.TypeString,
      default: "",
    },

    password: {
      type: schemaType.TypeString,
      required: true,
    },

    role: {
      type: schemaType.TypeString,
      enum: ["admin", "user"],
      default: "user", // admin chỉ quản lý user
    },

    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = userSchema;
