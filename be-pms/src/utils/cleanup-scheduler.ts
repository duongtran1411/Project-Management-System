import passwordResetService from "../services/password-reset.service";
import { ProjectInvitation } from "../models/project.contributor.model";

// Cleanup expired invitations
export const cleanupExpiredInvitations = async () => {
  try {
    const result = await ProjectInvitation.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: new Date() },
      },
      {
        status: "expired",
      }
    );
  } catch (error) {
    console.error("Error cleaning up expired invitations:", error);
  }
};

// Schedule cleanup job to run every hour
export const startCleanupScheduler = (): void => {
  setInterval(async () => {
    await cleanupExpiredInvitations();
  }, 60 * 60 * 1000); // 1 giờ
};

// Chạy cleanup ngay lập tức khi khởi động
export const runInitialCleanup = async (): Promise<void> => {
  try {
    await passwordResetService.cleanupExpiredTokens();
    await cleanupExpiredInvitations();
  } catch (error) {
    console.error("Initial cleanup error:", error);
  }
};
