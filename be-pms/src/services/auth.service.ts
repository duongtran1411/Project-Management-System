import crypto from "crypto";
import { PasswordReset, Role } from "../models";
import User, { IUser } from "../models/user.model";
import EmailVerification from "../models/email.verification.model";
import {
  sendOTPEmail,
  sendPasswordEmail,
  sendRegistrationOTPEmail,
} from "../utils/email.util";
import { verifyGoogleIdToken } from "../utils/google-auth.util";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../utils/jwt.util";
import {
  generateOTP,
  generateResetToken,
  hashOTP,
  verifyOTP,
} from "../utils/password-reset.util";
import { generateRandomPassword } from "../utils/password.util";
import refreshTokenService from "./refresh-token.service";

interface LoginResponse {
  user: Partial<IUser>;
  access_token: string;
  refresh_token: string;
  token_id: string;
}

interface RegisterResponse {
  message: string;
  userId: string;
}

export class AuthService {
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const googleUser = await verifyGoogleIdToken(idToken);
    let user = await User.findOne({ email: googleUser.email });
    let roleDefault = await Role.findOne({ name: { $eq: "USER" } });
    let isNewUser = false;
    let tempPassword = "";
    if (!user) {
      tempPassword = generateRandomPassword();
      user = await User.create({
        fullName: googleUser.name,
        email: googleUser.email,
        password: tempPassword,
        avatar: googleUser.picture,
        status: "ACTIVE",
        verified: true,
        role: roleDefault?._id,
      });
      isNewUser = true;
      await sendPasswordEmail(user.email, user.fullName, tempPassword);
    }
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    user.lastLogin = new Date();
    await user.save();
    user = await User.findById(user._id).populate("role");

    const tokenId = crypto.randomBytes(32).toString("hex");

    if (user) {
      await refreshTokenService.saveRefreshToken(
        (user._id as any).toString(),
        tokenId,
        90 * 24 * 60 * 60 // 90 days in seconds
      );
    }

    const access_token = generateToken(user as IUser);
    const refresh_token = generateRefreshToken(user as IUser);
    const { password: _, ...userResponse } = user?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
      token_id: tokenId,
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
      throw new Error("Email không tồn tại, hãy đăng kí tài khoản");
    }
    if (!user.isActive) {
      throw new Error("Tài khoản đã bị vô hiệu hoá");
    }

    // Kiểm tra email verification (chỉ áp dụng cho user thường, không áp dụng cho admin)
    if (!user.verified && user.role && (user.role as any).name !== "ADMIN") {
      const err: any = new Error("Vui lòng xác thực email trước khi đăng nhập");
      err.requireEmailVerification = true;
      throw err;
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

    const populatedUser = await User.findById(user._id).populate("role");

    const tokenId = crypto.randomBytes(32).toString("hex");

    if (populatedUser) {
      await refreshTokenService.saveRefreshToken(
        (populatedUser._id as any).toString(),
        tokenId,
        90 * 24 * 60 * 60 // 90 days in seconds
      );
    }

    const access_token = generateToken(populatedUser as IUser);
    const refresh_token = generateRefreshToken(populatedUser as IUser);
    const { password: _, ...userResponse } = populatedUser?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
      token_id: tokenId,
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

    // Generate token ID for refresh token
    const tokenId = crypto.randomBytes(32).toString("hex");

    // Save refresh token to Redis/memory
    if (populatedUser) {
      await refreshTokenService.saveRefreshToken(
        (populatedUser._id as any).toString(),
        tokenId,
        90 * 24 * 60 * 60 // 90 days in seconds
      );
    }

    const access_token = generateToken(populatedUser as IUser);
    const refresh_token = generateRefreshToken(populatedUser as IUser);
    const { password: _, ...userResponse } = populatedUser?.toObject() || {};
    return {
      user: userResponse,
      access_token,
      refresh_token,
      token_id: tokenId, // Trả về token_id để client sử dụng khi logout
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

  async refreshToken(refresh_token: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_id: string;
  }> {
    try {
      const decoded = verifyToken(refresh_token);

      const user = await User.findById(decoded.userId).populate("role");
      if (!user || user.status === "DELETED") {
        throw new Error("User not found or deleted");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      const tokenValidation = await refreshTokenService.validateRefreshToken(
        refresh_token
      );
      if (tokenValidation === null) {
        console.log("Refresh token not found in Redis, but JWT is valid");
      }

      const newTokenId = crypto.randomBytes(32).toString("hex");

      await refreshTokenService.saveRefreshToken(
        decoded.userId,
        newTokenId,
        90 * 24 * 60 * 60
      );

      const newAccessToken = generateToken(user as IUser);
      const newRefreshToken = generateRefreshToken(user as IUser);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_id: newTokenId,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    try {
      // Revoke refresh token in Redis using tokenId
      await refreshTokenService.revokeRefreshToken(tokenId);
      console.log(`Refresh token revoked: ${tokenId}`);
    } catch (error) {
      console.error("Error revoking refresh token:", error);
      throw error;
    }
  }

  async register(email: string): Promise<RegisterResponse> {
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email không hợp lệ");
    }

    // Xóa các record cũ của email này để tránh duplicate key error
    await EmailVerification.deleteMany({
      email,
      isUsed: false,
      expiresAt: { $lt: new Date() }, // Xóa các record đã hết hạn
    });

    // Tạo OTP code (6 chữ số)
    const otp = generateOTP();

    // Lưu OTP vào EmailVerification model
    await EmailVerification.create({
      email,
      otp: hashOTP(otp),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 phút
      isUsed: false,
    });

    // Gửi email với OTP code cho registration
    await sendRegistrationOTPEmail(email, otp);

    console.log(`Registration OTP sent to ${email}: ${otp}`);

    return {
      message: "Mã xác thực đã được gửi đến email của bạn",
      userId: "",
    };
  }

  async verifyRegistrationOTP(
    email: string,
    otp: string
  ): Promise<{ token: string; message: string }> {
    // Tìm record mới nhất và chưa sử dụng
    const verificationRecord = await EmailVerification.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verificationRecord) {
      throw new Error("Email không tồn tại hoặc mã đã hết hạn");
    }

    // Kiểm tra số lần thử
    if ((verificationRecord.attempts || 0) >= 3) {
      throw new Error("Đã vượt quá số lần thử, vui lòng yêu cầu mã mới");
    }

    // Tăng số lần thử
    verificationRecord.attempts = (verificationRecord.attempts || 0) + 1;
    await verificationRecord.save();

    // Xác thực OTP
    if (!verificationRecord.otp || !verifyOTP(otp, verificationRecord.otp)) {
      throw new Error("Mã xác thực không đúng");
    }

    // Tạo setup token cho bước tiếp theo
    const setupToken = crypto.randomBytes(32).toString("hex");

    // Cập nhật record với setup token
    verificationRecord.token = setupToken;
    verificationRecord.isUsed = false;
    await verificationRecord.save();

    return {
      token: setupToken,
      message: "Xác thực email thành công",
    };
  }

  async setupAccount(
    token: string,
    fullName: string,
    password: string
  ): Promise<RegisterResponse> {
    // Validate password strength (giống Jira)
    if (password.length < 8) {
      throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
    }

    // Tìm verification record
    const verificationRecord = await EmailVerification.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra email đã được sử dụng chưa
    const existingUser = await User.findOne({
      email: verificationRecord.email,
    });
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Lấy role mặc định
    const roleDefault = await Role.findOne({ name: { $eq: "USER" } });
    if (!roleDefault) {
      throw new Error("Không tìm thấy role mặc định");
    }

    // Tạo user mới với trạng thái đã verify
    const user = await User.create({
      fullName,
      email: verificationRecord.email,
      password,
      status: "ACTIVE",
      verified: true, // Đã verify qua token
      role: roleDefault._id,
      failedLoginAttempts: 0,
    });

    // Đánh dấu token đã sử dụng
    verificationRecord.isUsed = true;
    await verificationRecord.save();

    return {
      message:
        "Tài khoản đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.",
      userId: (user._id as any).toString(),
    };
  }

  async sendVerificationEmail(
    email: string,
    fullName: string,
    userId: string
  ): Promise<void> {
    // Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Lưu token vào EmailVerification model
    await EmailVerification.create({
      email,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 phút
      isUsed: false,
    });

    // Gửi email verification
    const verificationUrl = `https://project-management-system-1ok8.vercel.app/verify-email?token=${verificationToken}`;

    console.log(
      `Verification email sent to ${email} with URL: ${verificationUrl}`
    );
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationRecord = await EmailVerification.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      throw new Error("Token xác thực không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findOne({ email: verificationRecord.email });
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    user.verified = true;
    await user.save();

    verificationRecord.isUsed = true;
    await verificationRecord.save();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    // Kiểm tra có verification record pending không
    const verificationRecord = await EmailVerification.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      throw new Error(
        "Email không tồn tại hoặc không có yêu cầu xác thực đang chờ"
      );
    }

    // Xóa verification record cũ
    await EmailVerification.deleteMany({ email, isUsed: false });

    // Gửi lại OTP mới
    const otp = generateOTP();

    await EmailVerification.create({
      email,
      otp: hashOTP(otp),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 phút
      isUsed: false,
    });

    // Gửi email với OTP mới
    await sendRegistrationOTPEmail(email, otp);

    console.log(`Resend registration OTP to ${email}: ${otp}`);
  }
}

export default new AuthService();
