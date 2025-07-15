import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/mongodb";
import routes from "./routes";
import { seedAdminRole, seedAdminUser, seedUserRole } from "./config/seed";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import "./models";
import {
  startCleanupScheduler,
  runInitialCleanup,
} from "./utils/cleanup-scheduler";
import { createServer } from "http";
import initSocket from "./utils/socket";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/", (_req, res) => {
  res.send("Project Management System API is running 🚀");
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
export const io = initSocket(httpServer)

const startServer = async () => {
  try {
    // Skip MongoDB connection if SKIP_DB is set
    if (process.env.SKIP_DB !== "true") {
      await connectDB();
      console.log("✅ Connected to MongoDB");
      await seedAdminRole();
      await seedUserRole();
      await seedAdminUser();
    } else {
      console.log("⚠️  Skipping MongoDB connection (SKIP_DB=true)");
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(
        `📝 API Documentation (SwaggerUI): http://localhost:${PORT}/api-docs`
      );
    });

    // Khởi động cleanup scheduler
    startCleanupScheduler();
    await runInitialCleanup();
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    console.log(
      "💡 TIP: You can run with SKIP_DB=true to skip database connection"
    );
    process.exit(1);
  }
};

startServer();
