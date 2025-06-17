import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
