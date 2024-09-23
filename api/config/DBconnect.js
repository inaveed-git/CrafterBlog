import mongoose from "mongoose";

async function connectDB() {
  try {
    const DB_URL = process.env.MONGO_URL; // Ensure this matches your .env variable
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export default connectDB;
