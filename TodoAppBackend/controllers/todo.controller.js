import Todo from "../models/todos.models.js";

export const createTodo = async (req, res) => {
     try {
          const { title, content } = req.body;
          if (!title) return res.status(400).json({ success: false, message: "Title required" });
          console.log(`Id will show there: ${req.user._id}`)
          const newtodo = await Todo.create({
               title,
               content,
               user: req.user.id
          });
          console.log("you are here now")
          
          res.status(201).json({ success: true, newtodo });
     } catch (err) {
          res.status(500).json({ success: false, message: `your todo not save yet: ${err.message}`, });
     }
};

export const getTodos = async (req, res) => {
     try {
          const Todos = await Todo.find({ user: req.user.id }).populate("user", "name email");
          res.status(200).json({ success: true, Todos });
     } catch (err) {
          res.status(500).json({ success: false, message: err.message });
     }
};

export const getTodoById = async (req, res) => {
     try {
          const Todo = await Todo.findById(req.params.id).populate("user", "name email");
          if (!Todo) return res.status(404).json({ success: false, message: "Not found" });
          if (Todo.user._id.toString() !== req.user.id) {
               return res.status(403).json({ success: false, message: "Not authorized" });
          }
          res.status(200).json({ success: true, Todo });
     } catch (err) {
          res.status(500).json({ success: false, message: err.message });
     }
};

export const updateTodo = async (req, res) => {
     try {
          const Todo = await Todo.findById(req.params.id);
          if (!Todo) return res.status(404).json({ success: false, message: "This todo Not found" });
          if (Todo.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
          Todo.title = req.body.title ?? Todo.title;
          Todo.content = req.body.content ?? Todo.content;
          const updated = await Todo.save();
          res.status(200).json({ success: true, Todo: updated });
     } catch (err) {
          res.status(500).json({ success: false, message: err.message });
     }
};

export const deleteTodo = async (req, res) => {
     try {
          const Todo = await Todo.findById(req.params.id);
          if (!Todo) return res.status(404).json({ success: false, message: "Not found" });
          if (Todo.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

          await Todo.remove();
          res.status(200).json({ success: true, message: "Todo Successfully Deleted" });
     } catch (err) {
          res.status(500).json({ success: false, message: err.message });
     }
};
