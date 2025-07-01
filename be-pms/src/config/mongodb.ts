import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Ưu tiên sử dụng MONGODB_URI (Atlas) nếu có, nếu không thì dùng MONGODB_URI_LOCAL (local)
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGODB_URI_LOCAL ||
      "mongodb://localhost:27017/PMS";

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log để biết đang sử dụng connection nào
    if (process.env.MONGODB_URI) {
      console.log("Using MongoDB Atlas connection");
    } else if (process.env.MONGODB_URI_LOCAL) {
      console.log("Using MongoDB Local connection");
    } else {
      console.log("Using default local MongoDB connection");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
