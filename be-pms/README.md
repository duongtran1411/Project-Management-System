# Project Management System - Backend

Backend API cho hệ thống quản lý dự án (giống Jira) được xây dựng với Express.js, TypeScript và MongoDB.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT-based authentication với refresh token
- **User Management**: Quản lý người dùng với các roles khác nhau
- **Project Management**: Tạo và quản lý projects
- **Task/Issue Management**: Tạo và quản lý tasks giống như Jira
- **Comments**: Comment trên tasks
- **Real-time updates**: (Coming soon với Socket.io)

## 📋 Yêu cầu

- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

## 🛠️ Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd be-pms
```

2. Cài đặt dependencies:

```bash
yarn install
```

3. Tạo file `.env` từ template:

```bash
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI_LOCAL=mongodb://localhost:27017/PMS

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Node Environment
NODE_ENV=development
```

4. Chạy server:

```bash
# Production mode
yarn start
```

## 🏗️ Cấu trúc Project

```
src/
├── config/         # Cấu hình (database, etc.)
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── server.ts       # Entry point
```

## 📚 API Documentation

### Authentication

#### Register

```
POST /api/v1/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "developer" // optional
}
```

#### Login

```
POST /api/v1/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh-token
Body: {
  "refresh_token": "your_refresh_token"
}
```

### Các API khác đang được phát triển...

## 🔐 User Roles

- `admin`: Full access
- `project_manager`: Quản lý projects và assign tasks
- `developer`: Tạo và update tasks
- `tester`: Test và report bugs
- `viewer`: Chỉ xem

## 🚧 Các bước tiếp theo

1. **Project APIs**:

   - CRUD cho projects
   - Quản lý team members
   - Project statistics

2. **Task/Issue APIs**:

   - CRUD cho tasks
   - Filters và search
   - Bulk operations

3. **Sprint Management**:

   - Tạo và quản lý sprints
   - Sprint planning và tracking

4. **Comments & Activities**:

   - Comment trên tasks
   - Activity feed

5. **File Upload**:

   - Upload attachments
   - Avatar upload

6. **Notifications**:

   - Email notifications
   - In-app notifications với Socket.io

7. **Reports & Analytics**:
   - Project progress
   - Team performance
   - Burndown charts

## 🧪 Testing

```bash
# Run tests (coming soon)
yarn test
```

## 📝 License

ISC
