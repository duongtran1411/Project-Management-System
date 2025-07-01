import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        return;
      } catch (atlasError) {
        console.log("MongoDB Atlas connection failed, trying local MongoDB...");
      }
    }

    const localUri =
      process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/PMS";
    const conn = await mongoose.connect(localUri);
    console.log(`MongoDB Local Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("All MongoDB connection attempts failed:", error);
    throw error;
  }
};
