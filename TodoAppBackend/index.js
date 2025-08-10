import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import connectDB from './db.js'
import todoRoutes from './routes/todo.routes.js'

dotenv.config()
connectDB();

const app = express()
app.use(express.json())
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/todos", todoRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
     console.log(`Server is running on http://localhost:${PORT}`);
})