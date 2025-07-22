interface RefreshTokenData {
  userId: string;
  tokenId: string;
  expiresAt: number;
}

export class RefreshTokenService {
  private redis: any = null;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      const Redis = require("ioredis");

      if (process.env.REDIS_URI) {
        this.redis = new Redis(process.env.REDIS_URI);
        console.log(
          "Redis connected using REDIS_URI for refresh token management"
        );
      } else {
        console.log("REDIS_URI not found, Redis not available");
        this.redis = null;
        return;
      }

      await this.redis.ping();
    } catch (error) {
      console.error("Redis connection failed:", (error as Error).message);
      console.log("Redis not available, using in-memory storage");
      this.redis = null;
    }
  }

  async saveRefreshToken(
    userId: string,
    tokenId: string,
    expiresIn: number
  ): Promise<void> {
    const tokenData: RefreshTokenData = {
      userId,
      tokenId,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    if (this.redis) {
      await this.redis.setex(
        `refresh_token:${tokenId}`,
        expiresIn,
        JSON.stringify(tokenData)
      );
    } else {
      console.warn(
        "Using in-memory storage for refresh tokens (not recommended for production)"
      );
    }
  }

  async validateRefreshToken(
    tokenId: string
  ): Promise<RefreshTokenData | null> {
    try {
      if (this.redis) {
        const tokenData = await this.redis.get(`refresh_token:${tokenId}`);
        if (!tokenData) return null;

        const parsed = JSON.parse(tokenData) as RefreshTokenData;
        if (Date.now() > parsed.expiresAt) {
          await this.revokeRefreshToken(tokenId);
          return null;
        }

        return parsed;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error validating refresh token:", error);
      return null;
    }
  }

  /**
   * Thu hồi refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    if (this.redis) {
      // Xóa token trực tiếp bằng tokenId
      const key = `refresh_token:${tokenId}`;
      const deleted = await this.redis.del(key);

      if (deleted > 0) {
        console.log(`Token revoked successfully: ${tokenId}`);
      } else {
        console.log(`Token not found in Redis: ${tokenId}`);
      }
    } else {
      console.warn("Redis not available, cannot revoke token");
    }
  }

  /**
   * Thu hồi tất cả refresh token của user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(`refresh_token:*`);
      for (const key of keys) {
        const tokenData = await this.redis.get(key);
        if (tokenData) {
          const parsed = JSON.parse(tokenData) as RefreshTokenData;
          if (parsed.userId === userId) {
            await this.redis.del(key);
          }
        }
      }
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(`refresh_token:*`);
      for (const key of keys) {
        const tokenData = await this.redis.get(key);
        if (tokenData) {
          const parsed = JSON.parse(tokenData) as RefreshTokenData;
          if (Date.now() > parsed.expiresAt) {
            await this.redis.del(key);
          }
        }
      }
    }
  }
}

export default new RefreshTokenService();
