import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
import { Role } from "../models";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middlewares/auth.middleware";

class UserController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullName, email, password, avatar } = req.body;
      let user = await User.findOne({ email: email });
      let roleDefault = await Role.findOne({ name: { $eq: "USER" } });
      let lastLogin = new Date();

      if (user) {
        res.status(400).json({
          success: false,
          message: "User already exist!",
          statusCode: 400,
        });
      }

      const newUser = new User({
        fullName,
        email,
        password,
        status: "ACTIVE",
        verified: true,
        avatar,
        role: roleDefault?._id,
        lastLogin,
      });
      const savedUser = await newUser.save();
      res.status(201).json({ success: true, data: savedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 50, page = 1, search = "" } = req.query;

      const numericLimit = Math.max(Number(limit), 1);
      const numericPage = Math.max(Number(page), 1);

      const query: any = {
        status: { $ne: "DELETED" },
      };

      if (search) {
        query.fullName = { $regex: search, $options: "i" };
      }

      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / numericLimit) || 1; // đảm bảo totalPages >= 1
      const currentPage = numericPage > totalPages ? totalPages : numericPage;
      const skip = (currentPage - 1) * numericLimit;

      const users = await User.find(query)
        .select("-password")
        .populate("role", "_id name")
        .skip(skip)
        .limit(numericLimit);

      res.json({
        success: true,
        data: users,
        total,
        totalPages,
        page: currentPage,
        limit: numericLimit,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const user = await User.findById(id).select("-password");
      if (!user || user.status === "DELETED") {
        res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const deletedUser = await User.findByIdAndUpdate(
        id,
        { status: "DELETED" },
        { new: true }
      );

      if (!deletedUser) {
        res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["ACTIVE", "INACTIVE", "DELETED"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'ACTIVE', 'INACTIVE', or 'DELETED'",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: `User status updated to ${status}`,
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const user = await User.findById(id).select(
        "fullname email avatar phone "
      );
      if (!user || user.status === "DELETED") {
        res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const allowedFields = ["fullName", "email", "password", "phone"];
      const updateData: any = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // Xử lý file upload avatar (field: file)
      if (req.file) {
        try {
          const result = await cloudinary.uploadImage(req.file.path, {
            public_id: `avatars/${id}_${Date.now()}_${req.file.originalname}`,
          });

          updateData.avatar = result.url;
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          res
            .status(500)
            .json({ success: false, message: "Upload avatar failed" });
          return;
        } finally {
          // Xoá file local nếu có
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }
      // Nếu không có file nhưng có avatar URL trong body
      else if (req.body.avatar) {
        updateData.avatar = req.body.avatar;
      }

      if (Object.keys(updateData).length === 0) {
        res
          .status(400)
          .json({ success: false, message: "No valid fields to update" });
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default new UserController();
