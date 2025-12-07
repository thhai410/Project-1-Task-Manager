import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskControllers.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;