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

export async function sendProjectInvitationEmail(
  to: string,
  inviterName: string,
  projectName: string,
  roleName: string,
  confirmUrl: string
) {
  await transporter.sendMail({
    from: "noreply@gmail.com",
    to,
    subject: `Bạn được mời tham gia dự án ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h2 style="color: #333; margin: 0;">Lời mời tham gia dự án</h2>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p>Xin chào,</p>
          
          <p><strong>${inviterName}</strong> đã mời bạn tham gia dự án <strong>${projectName}</strong> với vai trò <strong>${roleName}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Thông tin dự án:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Dự án:</strong> ${projectName}</li>
              <li><strong>Vai trò:</strong> ${roleName}</li>
              <li><strong>Người mời:</strong> ${inviterName}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xác nhận tham gia
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Link này có hiệu lực trong 7 ngày. Nếu bạn không muốn tham gia, vui lòng bỏ qua email này.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Nếu bạn gặp vấn đề với link trên, hãy copy và paste link này vào trình duyệt:<br>
            <span style="word-break: break-all;">${confirmUrl}</span>
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Email này được gửi từ hệ thống Project Management System</p>
        </div>
      </div>
    `,
  });
}
