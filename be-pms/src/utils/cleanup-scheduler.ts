import passwordResetService from "../services/password-reset.service";

// Chạy cleanup mỗi giờ
export const startCleanupScheduler = (): void => {
  setInterval(async () => {
    try {
      await passwordResetService.cleanupExpiredTokens();
    } catch (error) {
      console.error("Cleanup scheduler error:", error);
    }
  }, 60 * 60 * 1000); // 1 giờ

  console.log("Password reset cleanup scheduler started");
};

// Chạy cleanup ngay lập tức khi khởi động
export const runInitialCleanup = async (): Promise<void> => {
  try {
    await passwordResetService.cleanupExpiredTokens();
    console.log("Initial cleanup completed");
  } catch (error) {
    console.error("Initial cleanup error:", error);
  }
};
