const mongoose = require("mongoose");
const schemaType = require("../../types");

const logSchema = new mongoose.Schema(
  {
    // Log thuộc task nào
    task_id: {
      type: schemaType.TypeObjectId,
      ref: "Task",
      required: true,
    },

    title: {
      type: schemaType.TypeString,
      required: true,
      trim: true,
    },

    description: {
      type: schemaType.TypeString,
      default: "",
    },

    worked_time: {
      type: schemaType.TypeNumber,
      default: 0,
    },

    user_id: {
      type: schemaType.TypeObjectId,
      ref: "User",
      required: true,
    },

    created_date: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = logSchema;
