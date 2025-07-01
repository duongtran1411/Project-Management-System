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
      <p>Đây là mật khẩu tạm thời của bạn: <b>${password}</b></p>
      <p>Hãy đổi mật khẩu sau khi đăng nhập.</p>`,
  });
}

export async function sendForgotPasswordEmail(
  to: string,
  name: string,
  password: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: "Mật khẩu tạm thời của bạn",
    html: `<p>Xin chào <b>${name}</b>,</p>
      <p>Đây là mật khẩu tạm thời của bạn: <b>${password}</b></p>
      <p>Hãy đổi mật khẩu sau khi đăng nhập.</p>`,
  });
}

export async function sendOTPEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: "Mã xác thực đặt lại mật khẩu",
    html: `<p>Xin chào <b>${name}</b>,</p>
      <p>Mã xác thực của bạn là: <b style="font-size: 24px; color: #007bff;">${otp}</b></p>
      <p>Mã này có hiệu lực trong 15 phút.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>`,
  });
}
