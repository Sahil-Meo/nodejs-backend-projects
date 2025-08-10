import express from "express";
import verifyToken from '../middelware/fetchUser.middleware.js';
import { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } from "../controllers/todo.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createTodo);
router.get("/", getTodos);
router.get("/:id", getTodoById);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
