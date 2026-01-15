const mongoose = require("mongoose");
const schemaType = require("../../types");

const taskSchema = new mongoose.Schema(
  {
    // Task thuộc project nào
    project_id: {
      type: schemaType.TypeObjectId,
      ref: "Project",
      required: true,
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
      default: 0,
    },

    worked_time: {
      type: schemaType.TypeNumber,
      default: 0,
    },

    priority: {
      type: schemaType.TypeString,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    assignee_id: {
      type: schemaType.TypeObjectId,
      ref: "User",
    },

    status: {
      type: schemaType.TypeString,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },

    progress: {
      type: schemaType.TypeNumber,
      default: 0,
      min: 0,
      max: 100,
    },

    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = taskSchema;