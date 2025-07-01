# Hướng dẫn sử dụng chức năng Password Reset với xác thực OTP

## Tổng quan

Chức năng forgot password đã được cải tiến với xác thực OTP để tăng tính bảo mật. Thay vì gửi mật khẩu mới trực tiếp, hệ thống sẽ gửi mã OTP để xác thực trước khi cho phép đặt lại mật khẩu.

## Quy trình hoạt động

### 1. Yêu cầu đặt lại mật khẩu

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn",
  "data": {
    "token": "reset_token_here"
  },
  "statusCode": 200
}
```

### 2. Xác thực OTP và đặt lại mật khẩu

**Endpoint:** `POST /auth/verify-otp-reset-password`

**Request Body:**

```json
{
  "token": "reset_token_from_step_1",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "statusCode": 200
}
```

## Tính năng bảo mật

### 1. OTP (One-Time Password)

- Mã OTP 6 chữ số được gửi qua email
- Có hiệu lực trong 15 phút
- Tự động hết hạn sau thời gian quy định

### 2. Rate Limiting

- Tối đa 3 lần thử OTP cho mỗi token
- Sau 3 lần thử sai, token sẽ bị vô hiệu hóa
- Người dùng phải yêu cầu mã mới

### 3. Token Security

- Token được tạo ngẫu nhiên 32 bytes
- Mỗi token chỉ có thể sử dụng một lần
- Tự động xóa sau khi sử dụng

### 4. Email Validation

- Chỉ gửi OTP đến email đã đăng ký
- Kiểm tra email tồn tại trong hệ thống

## Quản lý cho Admin

### 1. Xem thống kê

**Endpoint:** `GET /password-reset/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 10,
    "active": 3,
    "expired": 5,
    "used": 2
  },
  "statusCode": 200
}
```

### 2. Dọn dẹp token hết hạn

**Endpoint:** `POST /password-reset/cleanup`

**Response:**

```json
{
  "success": true,
  "message": "Đã dọn dẹp các token hết hạn",
  "statusCode": 200
}
```

## Database Schema

### PasswordReset Model

```typescript
{
  email: string; // Email người dùng
  token: string; // Token reset password
  otp: string; // OTP đã hash
  expiresAt: Date; // Thời gian hết hạn
  isUsed: boolean; // Đã sử dụng chưa
  attempts: number; // Số lần thử
  maxAttempts: number; // Số lần thử tối đa
  createdAt: Date;
  updatedAt: Date;
}
```

## Logging

Tất cả các hoạt động liên quan đến password reset đều được log:

- `FORGOT_PASSWORD_REQUEST`: Yêu cầu đặt lại mật khẩu
- `PASSWORD_RESET`: Đặt lại mật khẩu thành công

## Lưu ý

1. OTP được hash trước khi lưu vào database
2. Token tự động hết hạn sau 15 phút
3. Hệ thống tự động dọn dẹp các token hết hạn
4. Mỗi email chỉ có thể có một request reset password chưa sử dụng
