import Todo from "../models/todos.models.js";

const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

export const createTodo = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title?.trim()) {
            return sendResponse(res, 400, false, "Title is required");
        }
        const newTodo = await Todo.create({
            title: title.trim(),
            content: content?.trim() || "",
            user: req.user.id
        });
        return sendResponse(res, 201, true, "Todo created successfully", newTodo);
    } catch (err) {
        console.error("Error creating todo:", err);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

export const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        return sendResponse(res, 200, true, "Todos fetched successfully", todos);
    } catch (err) {
        console.error("Error fetching todos:", err);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

export const getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id).populate("user", "name email");
        if (!todo) {
            return sendResponse(res, 404, false, "Todo not found");
        }
        if (todo.user._id.toString() !== req.user.id) {
            return sendResponse(res, 403, false, "Not authorized");
        }
        return sendResponse(res, 200, true, "Todo fetched successfully", todo);
    } catch (err) {
        console.error("Error fetching todo:", err);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

export const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return sendResponse(res, 404, false, "Todo not found");
        }
        if (todo.user.toString() !== req.user.id) {
            return sendResponse(res, 403, false, "Not authorized");
        }
        todo.title = req.body.title?.trim() || todo.title;
        todo.content = req.body.content?.trim() || todo.content;
        const updatedTodo = await todo.save();
        return sendResponse(res, 200, true, "Todo updated successfully", updatedTodo);
    } catch (err) {
        console.error("Error updating todo:", err);
        return sendResponse(res, 500, false, "Internal server error");
    }
};

export const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return sendResponse(res, 404, false, "Todo not found");
        }
        if (todo.user.toString() !== req.user.id) {
            return sendResponse(res, 403, false, "Not authorized");
        }
        await todo.deleteOne();
        return sendResponse(res, 200, true, "Todo successfully deleted");
    } catch (err) {
        console.error("Error deleting todo:", err);
        return sendResponse(res, 500, false, "Internal server error");
    }
};
