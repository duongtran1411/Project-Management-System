import { Request, Response } from "express";
import EmailTemplate from "../models/email.template.model";
import mongoose from "mongoose";

export class EmailTemplateController {
  async create(req: Request, res: Response) {
    try {
      const template = await EmailTemplate.create(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const templates = await EmailTemplate.find({
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await EmailTemplate.findOne({
        _id: id,
        status: { $ne: "DELETED" },
      });
      if (!template) {
        return res
          .status(404)
          .json({ success: false, message: "Email Template not found" });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await EmailTemplate.findById(id);
      if (!existing || existing.status === "DELETED") {
        return res
          .status(404)
          .json({ success: false, message: "Email Template not found" });
      }

      const updated = await EmailTemplate.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, data: updated });
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
          .json({ success: false, message: "Invalid email template ID" });
      }

      const deletedEmailTemplate = await EmailTemplate.findByIdAndUpdate(
        id,
        { status: "DELETED" },
        { new: true }
      );

      if (!deletedEmailTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Email Template not found" });
      }
      res.json({ success: true, message: "Email Template deleted" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new EmailTemplateController();
