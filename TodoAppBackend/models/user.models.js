import mongoose from "mongoose";

const userSchema = mongoose.Schema({

     name: {
          type: String,
          required: [true, "Name is required"]
     },
     email: {
          type: String,
          required: [true, "email is required"],
          unique: true
     },
     password: {
          type: String,
          required: [true, "password is required"]
     }


}, { timestamps: true })

export default mongoose.model("User", userSchema)