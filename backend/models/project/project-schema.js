const mongoose = require("mongoose");
const schemaType = require("../../types");

const memberSchema = new mongoose.Schema(
  {
    user_id: {
      type: schemaType.TypeObjectId,
      ref: "user",
      required: true,
    },
    role: {
      type: schemaType.TypeString,
      enum: ["admin", "member"],
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
    name: {
      type: schemaType.TypeString,
      required: true,
      trim: true,
    },

    description: {
      type: schemaType.TypeString,
      default: "",
    },

    owner_id: {
      type: schemaType.TypeObjectId,
      ref: "user",
      required: true,
    },

    members: {
      type: [memberSchema],
      default: [],
    },

    title: {
      type: schemaType.TypeString,
      default: "",
    },

    description_detail: {
      type: schemaType.TypeString,
      default: "",
    },

    due_date: {
      type: schemaType.TypeDate,
    },

    progress: {
      type: schemaType.TypeString,
      default: "0",
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
