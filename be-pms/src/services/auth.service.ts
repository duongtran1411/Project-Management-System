import User, { IUser } from "../models/user.model";
import { verifyGoogleIdToken } from "../utils/google-auth.util";
import {
  sendForgotPasswordEmail,
  sendPasswordEmail,
  sendOTPEmail,
} from "../utils/email.util";
import { generateRandomPassword } from "../utils/password.util";
import { generateRefreshToken, generateToken } from "../utils/jwt.util";
import { Role, PasswordReset } from "../models";
import {
  generateOTP,
  generateResetToken,
  hashOTP,
  verifyOTP,
} from "../utils/password-reset.util";
import roleService from "./role.service";

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
    let roleDefault = await Role.findOne({ name: { $eq: "USER" } });
    let isNewUser = false;
    let tempPassword = "";
    if (!user) {
      // 3. Nếu chưa có user, tạo user mới với mật khẩu random
      tempPassword = generateRandomPassword();
      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        password: tempPassword,
        avatar: googleUser.picture,
        status: "ACTIVE",
        verified: true,
        role: roleDefault?._id, // Chỉ lưu ObjectId của role
      });
      isNewUser = true;
      // 4. Chỉ gửi email mật khẩu khi tạo user mới lần đầu
      await sendPasswordEmail(user.email, user.fullName, tempPassword);
    }
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    // 5. Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();
    // 6. Populate role để đảm bảo có đầy đủ thông tin role
    user = await User.findById(user._id).populate("role");
    // 7. Trả về JWT
    const access_token = generateToken(user as IUser);
    const refresh_token = generateRefreshToken(user as IUser);
    const { password: _, ...userResponse } = user?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
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
    // Populate role để đảm bảo có đầy đủ thông tin role
    const populatedUser = await User.findById(user._id).populate("role");
    const access_token = generateToken(populatedUser as IUser);
    const refresh_token = generateRefreshToken(populatedUser as IUser);
    const { password: _, ...userResponse } = populatedUser?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
  }

  async loginWithEmailAdmin(
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

    // Kiểm tra role admin
    if (!user.role || (user.role as any).name !== "ADMIN") {
      throw new Error("Chỉ admin mới có quyền truy cập vào trang này");
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

    // Populate role để đảm bảo có đầy đủ thông tin role
    const populatedUser = await User.findById(user._id).populate("role");
    const access_token = generateToken(populatedUser as IUser);
    const refresh_token = generateRefreshToken(populatedUser as IUser);
    const { password: _, ...userResponse } = populatedUser?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
    };
  }

  async forgotPassword(
    email: string
  ): Promise<{ token: string; message: string }> {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Không tìm thấy người dùng với email này");

    // Xóa các request reset password cũ
    await PasswordReset.deleteMany({ email, isUsed: false });

    // Tạo OTP và token
    const otp = generateOTP();
    const token = generateResetToken();

    // Lưu thông tin reset password
    await PasswordReset.create({
      email,
      token,
      otp: hashOTP(otp),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });

    // Gửi OTP qua email
    await sendOTPEmail(user.email, user.fullName, otp);

    return {
      token,
      message: "Mã xác thực đã được gửi đến email của bạn",
    };
  }

  async verifyOTPAndResetPassword(
    token: string,
    otp: string,
    newPassword: string
  ): Promise<void> {
    const resetRecord = await PasswordReset.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra số lần thử
    if (resetRecord.attempts >= resetRecord.maxAttempts) {
      throw new Error("Đã vượt quá số lần thử, vui lòng yêu cầu mã mới");
    }

    // Tăng số lần thử
    resetRecord.attempts += 1;
    await resetRecord.save();

    // Xác thực OTP
    if (!verifyOTP(otp, resetRecord.otp)) {
      throw new Error("Mã xác thực không đúng");
    }

    // Cập nhật mật khẩu
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    user.password = newPassword;
    user.failedLoginAttempts = 0;
    await user.save();

    // Đánh dấu token đã sử dụng
    resetRecord.isUsed = true;
    await resetRecord.save();
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
