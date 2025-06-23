import { Request, Response } from "express";
import EmailTemplate from "../models/email.template.model";
import mongoose from "mongoose";

export class EmailTemplateController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await EmailTemplate.create(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await EmailTemplate.find({
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await EmailTemplate.findOne({
        _id: id,
        status: { $ne: "DELETED" },
      });
      if (!template) {
        res
          .status(404)
          .json({ success: false, message: "Email Template not found" });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const existing = await EmailTemplate.findById(id);
      if (!existing || existing.status === "DELETED") {
        res
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
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid email template ID" });
      }

      const deletedEmailTemplate = await EmailTemplate.findByIdAndUpdate(
        id,
        { status: "DELETED" },
        { new: true }
      );

      if (!deletedEmailTemplate) {
        res
          .status(404)
          .json({ success: false, message: "Email Template not found" });
      }
      res.json({ success: true, message: "Email Template deleted" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default new EmailTemplateController();
