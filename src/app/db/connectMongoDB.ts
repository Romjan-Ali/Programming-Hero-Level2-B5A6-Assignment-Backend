import mongoose from "mongoose";
import { envVars } from "../config/env";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(envVars.MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error: any) {
    console.log(`Error connection to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

export default connectMongoDB