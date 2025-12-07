const mongoose = require("mongoose");
const schemaType = require("../../types");

const memberSchema = new mongoose.Schema(
  {
    user_id: {
      type: schemaType.TypeObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: schemaType.TypeString,
      enum: ["owner", "member", "viewer"],
      default: "member",
    },

    joined_at: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    project_owner_id: {
      type: schemaType.TypeObjectId,
      ref: "User",
      required: true,
    },

    members: {
      type: [memberSchema],
      default: [],
    },

    title: {
      type: schemaType.TypeString,
      required: true,
      trim: true,
    },

    des: {
      type: schemaType.TypeString,
      default: "",
    },

    due_date: {
      type: schemaType.TypeDate,
    },

    estimate_time: {
      type: schemaType.TypeNumber,
      default: 0, // giờ hoặc ngày tuỳ bạn quy ước
    },

    progress: {
      type: schemaType.TypeNumber,
      default: 0, // %
    },

    status: {
      type: schemaType.TypeString,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },

    document: {
      type: schemaType.TypeString,
      default: "",
    },

    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = projectSchema;
