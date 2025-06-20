import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../utils/google-auth.util";
import {
  sendForgotPasswordEmail,
  sendPasswordEmail,
} from "../utils/email.util";
import { generateRandomPassword } from "../utils/password.util";
import { generateToken, generateRefreshToken } from "../utils/jwt.util";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

interface LoginResponse {
  user: Partial<IUser>;
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    // 1. Xác thực token với Google
    const googleUser = await verifyGoogleIdToken(idToken);
    // 2. Tìm user theo email
    let user = await User.findOne({ email: googleUser.email });
    let isNewUser = false;
    let tempPassword = "";
    if (!user) {
      // 3. Nếu chưa có user, tạo user mới với mật khẩu random
      tempPassword = generateRandomPassword();
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
      // 4. Chỉ gửi email mật khẩu khi tạo user mới lần đầu
      await sendPasswordEmail(
        user.email,
        user.fullName || user.name,
        tempPassword
      );
    }
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    // 5. Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();
    // 6. Trả về JWT
    const access_token = generateToken(user);
    const refresh_token = generateRefreshToken(user);
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

      const token = generateToken(user);
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
      throw new Error("Email không tồn tại");
    }
    if (!user.isActive) {
      throw new Error("Tài khoản đã bị vô hiệu hoá");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      if (user.failedLoginAttempts >= 2) {
        const err: any = new Error(
          "Mật khẩu của bạn không đúng, vui lòng đổi mật khẩu"
        );
        err.suggestForgotPassword = true;
        throw err;
      }
      throw new Error("Mật khẩu của bạn không đúng");
    }
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();
    const access_token = generateToken(user);
    const refresh_token = generateRefreshToken(user);
    const { password: _, ...userResponse } = user.toObject();
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Không tìm thấy người dùng với email này");
    const tempPassword = generateRandomPassword();
    user.password = tempPassword;
    user.failedLoginAttempts = 0;
    await user.save();
    await sendForgotPasswordEmail(
      user.email,
      user.fullName || user.name,
      tempPassword
    );
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("Email không tồn tại");
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Mật khẩu cũ không đúng");
    user.password = newPassword;
    await user.save();
  }
}

export default new AuthService();
