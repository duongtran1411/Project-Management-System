import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.route";
import statisticsRoutes from "./statistics.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/statistics", statisticsRoutes);

// Health check
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
