import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
import { Role } from "../models";

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
      const users = await User.find({ status: { $ne: "DELETED" } }).select(
        "-password"
      );
      res.json({ success: true, data: users });
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
}

export default new UserController();
