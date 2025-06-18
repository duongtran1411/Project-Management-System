import crypto from "crypto";

export function generateRandomPassword(length = 8): string {
  return crypto
    .randomBytes(6)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}
