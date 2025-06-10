import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

interface LoginResponse {
  user: Partial<IUser>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  async register(userData: {
    name: string;
    email: string;
    password: string;
    roles?: string;
  }): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create new user
    const user = await User.create({
      name: userData.name,
      fullName: userData.name, // Map name to fullName as well
      email: userData.email,
      password: userData.password,
      roles: userData.roles,
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without password
    const { password: _, ...userResponse } = user.toObject();

    return {
      user: userResponse,
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without password
    const { password: _p, ...userResponse } = user.toObject();

    return {
      user: userResponse,
      token,
      refreshToken,
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

  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: (user._id as any).toString(),
        email: user.email,
        roles: user.roles,
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
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: "90d" }
    );
  }
}

export default new AuthService();
