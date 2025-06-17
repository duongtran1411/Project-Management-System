import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../utils/google-auth.util";
import { sendPasswordEmail } from "../utils/email.util";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

interface LoginResponse {
  user: Partial<IUser>;
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  /**
   * Đăng nhập bằng Google ID token. Nếu user chưa tồn tại sẽ tạo user mới với mật khẩu random và gửi email cho user.
   * @param idToken Google ID token từ FE
   * @returns LoginResponse gồm user, token, refreshToken
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    // 1. Xác thực token với Google
    const googleUser = await verifyGoogleIdToken(idToken);
    // 2. Tìm user theo email
    let user = await User.findOne({ email: googleUser.email });
    let isNewUser = false;
    let tempPassword = "";
    if (!user) {
      // 3. Nếu chưa có user, tạo user mới với mật khẩu random
      tempPassword = crypto
        .randomBytes(6)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 8);
      user = await User.create({
        name: googleUser.name,
        fullName: googleUser.name,
        email: googleUser.email,
        password: tempPassword,
        avatar: googleUser.picture,
        status: "ACTIVE",
        verified: true,
      });
      isNewUser = true;
    }
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    // 4. Nếu là user mới, gửi email mật khẩu
    if (isNewUser) {
      await sendPasswordEmail(
        user.email,
        user.fullName || user.name,
        tempPassword
      );
    }
    // 5. Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();
    // 6. Trả về JWT
    const access_token = this.generateToken(user);
    const refresh_token = this.generateRefreshToken(user);
    const { password: _, ...userResponse } = user.toObject();
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error("Invalid refresh token");
      }

      const token = this.generateToken(user);
      return { token };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async loginWithEmail(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role");
    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }
    if (!user.isActive) {
      throw new Error("Tài khoản đã bị vô hiệu hoá");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Mật khẩu của bạn không đúng");
    }
    user.lastLogin = new Date();
    await user.save();
    const access_token = this.generateToken(user);
    const refresh_token = this.generateRefreshToken(user);
    const { password: _, ...userResponse } = user.toObject();
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "90d" }
    );
  }
}

export default new AuthService();
