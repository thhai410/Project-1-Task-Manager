# Task Manager – Fullstack Web Application

## 📌 Giới thiệu

**Task Manager** là một ứng dụng web fullstack giúp người dùng quản lý công việc cá nhân: tạo, cập nhật, theo dõi trạng thái và quản lý tài khoản người dùng.

Dự án được thực hiện trong khuôn khổ **Project 1**.

---

## 🏗️ Kiến trúc tổng thể

* **Frontend**: ReactJS + TailwindCSS
* **Backend**: Node.js + Express
* **Database**: MongoDB (MongoDB Atlas)
* **Authentication**: JWT
* **Deployment**: Render (single service)

---

## 📂 Cấu trúc thư mục

```txt
project-root/
│
├── backend/
│   ├── config/          # Cấu hình database, env, constants
│   ├── helpers/         # Hàm dùng chung
│   ├── middleware/      # Auth, error handling, verify token
│   ├── models/          # Schema MongoDB (User, Task, ...)
│   ├── routes/          # API routes
│   ├── types/           # Custom types / constants
│   ├── create-admin.js  # Script tạo tài khoản admin
│   ├── index.js         # Entry point backend
│   ├── package.json
│   └── .env             # Biến môi trường (không push GitHub)
│
├── frontend/
│   ├── build/           # React build (dùng khi deploy)
│   ├── public/
│   ├── src/             # Source code React
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
├── docs/                # Tài liệu (nếu có)
├── .gitignore
└── README.md
```

---

## ✨ Chức năng chính

### 👤 Người dùng & Xác thực

* Đăng ký / đăng nhập tài khoản
* Xác thực bằng JWT + refresh token
* Lấy thông tin người dùng hiện tại
* Phân quyền User / Admin

### 🗂️ Project

* Tạo project mới
* Cập nhật thông tin project
* Xóa project
* Lấy danh sách project
* Thêm thành viên vào project

### 📝 Task

* Tạo task trong project
* Cập nhật task
* Xóa task
* Lấy danh sách task theo project

### 📒 Log (Activity Log)

* Ghi log thao tác
* Cập nhật log
* Xóa log
* Xem chi tiết log

### 📊 Dashboard

* Thống kê tổng quan (task, project, user, log)

### 🔑 Admin

* Xem thống kê hệ thống
* Xem danh sách user
* Xem toàn bộ project
* Xem toàn bộ task
* Xem toàn bộ log

---

## 📡 API Endpoints

### Auth (`/api/auth`)

* POST `/signup` – Đăng ký tài khoản
* POST `/login` – Đăng nhập
* GET `/me` – Lấy thông tin user hiện tại
* POST `/refresh` – Refresh access token

### Dashboard (`/api/dashboard`)

* GET `/get-dashboard` – Lấy dữ liệu tổng quan

### Project (`/api/project`)

* POST `/add-prj` – Tạo project mới
* GET `/get-prj` – Lấy danh sách project
* GET `/get-detail/:id` – Lấy chi tiết project
* PUT `/update-prj/:id` – Cập nhật project
* DELETE `/delete-prj/:id` – Xóa project
* POST `/add-member` – Thêm thành viên vào project

### Task (`/api/task`)

* POST `/add-task` – Tạo task
* GET `/get-task` – Lấy danh sách task
* PUT `/update-task/:id` – Cập nhật task
* DELETE `/delete-task/:id` – Xóa task

### Log (`/api/log`)

* POST `/add-log` – Thêm log
* GET `/get-log` – Lấy log
* PUT `/update-log/:id` – Cập nhật log
* DELETE `/delete-log/:id` – Xóa log

### Admin (`/api/admin`)

* GET `/get-admin-stats` – Thống kê hệ thống
* GET `/get-all-users` – Danh sách user
* GET `/get-all-projects` – Danh sách project
* GET `/get-all-tasks` – Danh sách task
* GET `/get-all-logs` – Danh sách log

---

## 🔐 Biến môi trường

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=/api
```

---

## ▶️ Chạy project ở local

### 1️⃣ Backend

```bash
cd backend
npm install
npm start
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🚀 Deploy (gộp frontend + backend)

### Build frontend

```bash
cd frontend
npm run build
```

### Backend serve frontend

Backend sử dụng thư mục `frontend/build` để serve giao diện React khi deploy.

### Nền tảng deploy

* Render (Node Web Service)

---

## 🛠️ Công nghệ sử dụng

* Node.js
* Express.js
* MongoDB & Mongoose
* ReactJS
* Tailwind CSS
* JWT Authentication
* Git & GitHub

---

## 👨‍💻 Tác giả

* **Đoàn Thanh Hải**

---