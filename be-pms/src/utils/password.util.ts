import crypto from "crypto";

export function generateRandomPassword(length = 8): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const all = letters + digits;
  const password: string[] = [];


  const letterIndex = crypto.randomBytes(1)[0] % letters.length;
  const digitIndex = crypto.randomBytes(1)[0] % digits.length;
  password.push(letters[letterIndex]);
  password.push(digits[digitIndex]);


  const remaining = length - 2;
  const bytes = crypto.randomBytes(remaining);
  for (let i = 0; i < remaining; i++) {
    password.push(all[bytes[i] % all.length]);
  }

 
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

