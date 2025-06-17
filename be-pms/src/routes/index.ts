import { Router } from "express";
import authRoutes from "./auth.routes";
import statisticsRoutes from "./statistics.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/statistics", statisticsRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
