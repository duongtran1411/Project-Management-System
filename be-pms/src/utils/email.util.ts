import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordEmail(
  to: string,
  name: string,
  password: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: "Tài khoản PMS của bạn đã được tạo",
    html: `<p>Xin chào <b>${name}</b>,</p>
      <p>Bạn vừa đăng nhập bằng Google. Đây là mật khẩu tạm thời của bạn: <b>${password}</b></p>
      <p>Hãy đăng nhập và đổi lại mật khẩu ngay.</p>`,
  });
}
