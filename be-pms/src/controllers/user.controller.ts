import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      res.status(201).json({ success: true, data: savedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const users = await User.find({ status: { $ne: "DELETED" } }).select(
        "-password"
      );
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID" });
      }

      const user = await User.findById(id).select("-password");
      if (!user || user.status === "DELETED") {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID" });
      }

      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID" });
      }

      const deletedUser = await User.findByIdAndUpdate(
        id,
        { status: "DELETED" },
        { new: true }
      );

      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new UserController();
