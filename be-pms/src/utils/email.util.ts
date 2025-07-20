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
            Lời mời có hiệu lực trong 7 ngày. Nếu bạn không muốn tham gia, vui lòng bỏ qua email này.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Email này được gửi từ hệ thống Project Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskAssignmentEmail(
  to: string,
  assigneeName: string,
  taskName: string,
  projectName: string,
  assignerName: string,
  taskUrl?: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: `[${projectName}] Bạn được giao task: ${taskName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 18px;">📋 Task Assignment</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <p style="margin: 0 0 15px 0; color: #333;">Xin chào <strong>${assigneeName}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Task:</strong> ${taskName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📁 Project:</strong> ${projectName}</p>
            <p style="margin: 0;"><strong>👤 Assigned by:</strong> ${assignerName}</p>
          </div>
          
          ${
            taskUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${taskUrl}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem Task
            </a>
          </div>
          `
              : ""
          }
          
          <p style="color: #666; font-size: 13px; margin: 20px 0 0 0;">
            Bạn có thể cập nhật trạng thái task trong hệ thống Project Management.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Project Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskStatusChangeEmail(
  to: string,
  userName: string,
  taskName: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  updatedBy: string,
  taskUrl?: string
) {
  const statusEmojis: { [key: string]: string } = {
    TO_DO: "📋",
    IN_PROGRESS: "🔄",
    DONE: "✅",
  };

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: `[${projectName}] Task "${taskName}" đã được cập nhật trạng thái`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 18px;">🔄 Status Update</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <p style="margin: 0 0 15px 0; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Task:</strong> ${taskName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📁 Project:</strong> ${projectName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📊 Status:</strong> ${
              statusEmojis[oldStatus] || "📋"
            } ${oldStatus} → ${statusEmojis[newStatus] || "📋"} ${newStatus}</p>
            <p style="margin: 0;"><strong>👤 Updated by:</strong> ${updatedBy}</p>
          </div>
          
          ${
            taskUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${taskUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem Task
            </a>
          </div>
          `
              : ""
          }
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Project Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskUpdateEmail(
  to: string,
  userName: string,
  taskName: string,
  projectName: string,
  updatedBy: string,
  changes: string[],
  taskUrl?: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: `[${projectName}] Task "${taskName}" đã được cập nhật`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 18px;">✏️ Task Updated</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <p style="margin: 0 0 15px 0; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #17a2b8;">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Task:</strong> ${taskName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📁 Project:</strong> ${projectName}</p>
            <p style="margin: 0 0 8px 0;"><strong>👤 Updated by:</strong> ${updatedBy}</p>
            <p style="margin: 0 0 8px 0;"><strong>📝 Changes:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              ${changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
          </div>
          
          ${
            taskUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${taskUrl}" style="background-color: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem Task
            </a>
          </div>
          `
              : ""
          }
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Project Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskUnassignedEmail(
  to: string,
  userName: string,
  taskName: string,
  projectName: string,
  unassignedBy: string,
  taskUrl?: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: `[${projectName}] Task "${taskName}" đã được hủy giao`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 18px;">❌ Task Unassigned</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <p style="margin: 0 0 15px 0; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc3545;">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Task:</strong> ${taskName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📁 Project:</strong> ${projectName}</p>
            <p style="margin: 0;"><strong>👤 Unassigned by:</strong> ${unassignedBy}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 15px 0;">
            Task này đã được hủy giao khỏi bạn. Nếu có thắc mắc, vui lòng liên hệ với người quản lý dự án.
          </p>
          
          ${
            taskUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${taskUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem Task
            </a>
          </div>
          `
              : ""
          }
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Project Management System</p>
        </div>
      </div>
    `,
  });
}

export async function sendTaskCreatedEmail(
  to: string,
  userName: string,
  taskName: string,
  projectName: string,
  createdBy: string,
  taskUrl?: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject: `[${projectName}] Task mới: ${taskName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 18px;">🆕 New Task</h2>
        </div>
        
        <div style="padding: 25px; background-color: #ffffff;">
          <p style="margin: 0 0 15px 0; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff;">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Task:</strong> ${taskName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📁 Project:</strong> ${projectName}</p>
            <p style="margin: 0;"><strong>👤 Created by:</strong> ${createdBy}</p>
          </div>
          
          ${
            taskUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${taskUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem Task
            </a>
          </div>
          `
              : ""
          }
          
          <p style="color: #666; font-size: 13px; margin: 20px 0 0 0;">
            Task mới đã được tạo trong dự án. Hãy kiểm tra và cập nhật thông tin cần thiết.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">Project Management System</p>
        </div>
      </div>
    `,
  });
}
