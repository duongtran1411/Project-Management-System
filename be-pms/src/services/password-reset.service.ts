import { PasswordReset } from "../models";

export class PasswordResetService {
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await PasswordReset.deleteMany({
        $or: [{ expiresAt: { $lt: new Date() } }, { isUsed: true }],
      });

      console.log(
        `Cleaned up ${result.deletedCount} expired password reset tokens`
      );
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  }

  async getResetStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    used: number;
  }> {
    const total = await PasswordReset.countDocuments();
    const active = await PasswordReset.countDocuments({
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
    const expired = await PasswordReset.countDocuments({
      expiresAt: { $lt: new Date() },
    });
    const used = await PasswordReset.countDocuments({ isUsed: true });

    return { total, active, expired, used };
  }
}

export default new PasswordResetService();
