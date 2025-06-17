import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.route";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
