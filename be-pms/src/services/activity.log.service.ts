import ActivityLog, { IActivityLog } from "../models/activity.log.model";
import { IpUtil } from "../utils/ip.util";
import { Request } from "express";
import mongoose from "mongoose";

export class ActivityLogService {
  async createLog(
    req: Request,
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    details?: any,
    status: "SUCCESS" | "FAILED" | "WARNING" = "SUCCESS",
    errorMessage?: string
  ): Promise<IActivityLog> {
    const ipAddress = IpUtil.getClientIp(req);
    const userAgent = IpUtil.getUserAgent(req);

    // Lấy thông tin địa lý từ IP (chỉ cho public IPs)
    let geoInfo = null;
    if (!IpUtil.isPrivateIp(ipAddress)) {
      geoInfo = await IpUtil.getIpGeoInfo(ipAddress);
    }

    const logData: Partial<IActivityLog> = {
      action,
      entity,
      entityId: entityId ? (entityId as any) : undefined,
      userId: userId ? (userId as any) : undefined,
      ipAddress,
      userAgent,
      details: details || {},
      status,
      errorMessage,
      requestMethod: req.method,
      requestUrl: req.originalUrl,
      sessionId: (req as any).session?.id || IpUtil.generateSessionId(),
      ...geoInfo,
    };

    const log = await ActivityLog.create(logData);
    return log;
  }

  async getLogs(filters: {
    action?: string;
    entity?: string;
    userId?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
    requestMethod?: string;
  }): Promise<{
    logs: IActivityLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    if (filters.action) query.action = filters.action;
    if (filters.entity) query.entity = filters.entity;
    if (filters.userId) query.userId = filters.userId;
    if (filters.ipAddress) query.ipAddress = filters.ipAddress;
    if (filters.country) query.country = filters.country;
    if (filters.city) query.city = filters.city;
    if (filters.status) query.status = filters.status;
    if (filters.requestMethod) query.requestMethod = filters.requestMethod;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("userId", "fullName email")
        .populate("entityId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ]);

    return { logs, total, page, limit };
  }

  /**
   * Lấy thống kê theo IP
   */
  async getIpStatistics(): Promise<any> {
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          countries: { $addToSet: "$country" },
          cities: { $addToSet: "$city" },
          actions: { $addToSet: "$action" },
          lastActivity: { $max: "$createdAt" },
          firstActivity: { $min: "$createdAt" },
        },
      },
      {
        $project: {
          ipAddress: "$_id",
          count: 1,
          countries: 1,
          cities: 1,
          actions: 1,
          lastActivity: 1,
          firstActivity: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 100 },
    ]);

    return stats;
  }

  /**
   * Lấy thống kê theo quốc gia
   */
  async getCountryStatistics(): Promise<any> {
    const stats = await ActivityLog.aggregate([
      {
        $match: { country: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
          uniqueIPs: { $addToSet: "$ipAddress" },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          country: "$_id",
          count: 1,
          uniqueIPs: { $size: "$uniqueIPs" },
          uniqueUsers: { $size: "$uniqueUsers" },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return stats;
  }

  /**
   * Lấy logs của một IP cụ thể
   */
  async getLogsByIp(
    ipAddress: string,
    limit: number = 100
  ): Promise<IActivityLog[]> {
    return ActivityLog.find({ ipAddress })
      .populate("userId", "fullName email")
      .populate("entityId")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Lấy logs của một user cụ thể
   */
  async getLogsByUser(
    userId: string,
    limit: number = 100
  ): Promise<IActivityLog[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return ActivityLog.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate("entityId")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Lấy suspicious activities (nhiều failed attempts, nhiều IPs khác nhau)
   */
  async getSuspiciousActivities(): Promise<any> {
    const suspicious = await ActivityLog.aggregate([
      {
        $match: {
          $or: [
            { action: "LOGIN_FAILED" },
            { status: "FAILED" },
            { action: "PERMISSION_DENIED" },
          ],
        },
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            ipAddress: "$ipAddress",
          },
          count: { $sum: 1 },
          actions: { $addToSet: "$action" },
          lastAttempt: { $max: "$createdAt" },
          firstAttempt: { $min: "$createdAt" },
        },
      },
      {
        $match: { count: { $gte: 5 } }, // 5+ failed attempts
      },
      {
        $sort: { count: -1 },
      },
      { $limit: 50 },
    ]);

    return suspicious;
  }

  /**
   * Xóa logs cũ (older than X days)
   */
  async cleanOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }

  /**
   * Export logs to CSV
   */
  async exportLogsToCSV(filters: any): Promise<string> {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    const headers = [
      "Timestamp",
      "Action",
      "Entity",
      "User",
      "IP Address",
      "Country",
      "City",
      "User Agent",
      "Status",
      "Details",
    ];

    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.createdAt.toISOString(),
          log.action,
          log.entity,
          log.userId ? (log.userId as any).fullName : "Anonymous",
          log.ipAddress,
          log.country || "Unknown",
          log.city || "Unknown",
          `"${log.userAgent || ""}"`,
          log.status,
          `"${JSON.stringify(log.details).replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  }
}

export default new ActivityLogService();
