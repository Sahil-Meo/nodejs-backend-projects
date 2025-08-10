import mongoose from "mongoose";

const todoSchema = mongoose.Schema({
     title: {
          type: String,
          required: [true, "title is required"],
     },
     content: {
          type: String,
          required: [true, "description is required"],
     },
     user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true
     }
}, { timestamps: true });

export default mongoose.model("Todo", todoSchema)