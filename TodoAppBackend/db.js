import mongoose from "mongoose";


const connectDB = async () => {
     try {
          const connect = await mongoose.connect(process.env.MONGO_URI)
          console.log(`MongoDB Connected Successfully!: ${connect.connection.host}`);
     } catch (error) {
          console.log(`MongoDB Connection Error: ${error}`)
          process.exit(1);
     }
}


export default connectDB;