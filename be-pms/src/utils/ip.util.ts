import { Request } from "express";

export class IpUtil {
  /**
   * Lấy IP address từ request
   * Hỗ trợ proxy, load balancer, CDN
   */
  static getClientIp(req: Request): string {
    // Kiểm tra các header phổ biến cho IP
    const headers = [
      "x-forwarded-for",
      "x-real-ip",
      "x-client-ip",
      "cf-connecting-ip", // Cloudflare
      "x-forwarded",
      "forwarded-for",
      "forwarded",
    ];

    for (const header of headers) {
      const value = req.headers[header];
      if (value) {
        // Xử lý trường hợp multiple IPs (x-forwarded-for: ip1, ip2, ip3)
        const ips = Array.isArray(value) ? value[0] : value;
        const firstIp = ips.split(",")[0].trim();
        if (this.isValidIp(firstIp)) {
          return firstIp;
        }
      }
    }

    // Fallback to connection IP
    if (req.connection && req.connection.remoteAddress) {
      return req.connection.remoteAddress;
    }

    // Fallback to socket IP
    if (req.socket && req.socket.remoteAddress) {
      return req.socket.remoteAddress;
    }

    // Fallback to request IP
    if (req.ip) {
      return req.ip;
    }

    return "unknown";
  }

  /**
   * Validate IP address format
   */
  static isValidIp(ip: string): boolean {
    if (!ip || ip === "unknown") return false;

    // IPv4 validation
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Lấy thông tin địa lý từ IP (sử dụng external API)
   * Có thể sử dụng: ipapi.co, ip-api.com, ipinfo.io
   */
  static async getIpGeoInfo(ip: string): Promise<any> {
    try {
      // Sử dụng ipapi.co (free tier: 1000 requests/day)
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        isp: data.org,
        timezone: data.timezone,
      };
    } catch (error) {
      console.error("Error fetching IP geo info:", error);
      return null;
    }
  }

  /**
   * Kiểm tra IP có phải là private/local không
   */
  static isPrivateIp(ip: string): boolean {
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^127\./, // 127.0.0.0/8 (localhost)
      /^169\.254\./, // 169.254.0.0/16 (link-local)
      /^::1$/, // IPv6 localhost
      /^fe80:/, // IPv6 link-local
      /^fc00:/, // IPv6 unique local
      /^fd00:/, // IPv6 unique local
    ];

    return privateRanges.some((range) => range.test(ip));
  }

  /**
   * Lấy User Agent từ request
   */
  static getUserAgent(req: Request): string {
    return req.headers["user-agent"] || "unknown";
  }

  /**
   * Tạo session ID
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
