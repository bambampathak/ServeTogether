# ServeTogether — Volunteer Registration & Management System

> A secure, premium volunteer registration and drive management system for **NayePankh Foundation**.

🤝 **ServeTogether** is a full-stack MERN-based web application that enables volunteers to register, update their profiles (including uploading profile pictures, ID proofs, and resumes), sign up for volunteering drives, and download registration certificates. It provides admins with a secure control panel to approve/reject volunteer registrations, manage volunteering drives (CRUD operations), track stats, and export CSV/PDF reports.

---

## 📋 Key Features

### 1. Secure Authentication & Registration
- **Dual Role System**: Separate accounts for Volunteers and Admins.
- **Database Isolation**: Volunteers are saved in the `volunteers` table, and Admins are saved in the `admins` table to ensure clean data organization.
- **Admin Access Code**: Registering as an Admin requires a secure access code (`ADMIN_REGISTRATION_CODE`) defined in the backend environment.
- **JWT-Based Authentication**: Secure stateless token authentication.

### 2. Volunteer Features
- **Profile Customization**: Choose from 20+ skills and define slot-based availability.
- **Document Uploads**: Upload profile photos, ID proofs, and resumes.
- **Drive Discovery & Registration**: View upcoming volunteering drives, register for them, or unregister if unavailable.
- **Acceptance Certificate**: Approved volunteers can download a custom, decorative PDF certificate of registration.

### 3. Admin Features
- **Volunteer Approvals**: Review pending volunteer applications and approve or reject them.
- **Drive Orchestration**: Full CRUD capabilities for volunteer drives (Create, Read, Update, Delete).
- **Interactive Analytics**: Visual summaries of total volunteers, pending reviews, approvals/rejections, age distribution, and availability alignment.
- **Data Export**:
  - **CSV Report**: Export detailed demographic data of volunteers.
  - **PDF Report**: Generate and print a professional PDF summary of volunteer demographics.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, React Router DOM, Axios, React Hot Toast, React Icons |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` |
| **PDF Generation** | `pdfkit` |

---

## 📁 Project Structure

```
ServeTogether/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Drive.js
│   │   └── Volunteer.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   └── drives.js
│   └── utils/
│       └── report.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Profile.jsx
│           ├── VolunteerDashboard.jsx
│           └── AdminDashboard.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas cluster (or a local MongoDB instance running at `mongodb://127.0.0.1:27017/servetogether`)

### Setup Instructions

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the environment template and configure the variables:
   ```env
   # Database URI
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/servetogether

   # JWT secret keys
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d

   # Port configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Admin Registration Access Code
   ADMIN_REGISTRATION_CODE=NayePankhAdmin2026
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file to configure the backend API endpoint:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5173`.

---

## 🔐 API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a volunteer or admin user (requires `adminCode` for admins).
* `POST /api/auth/login` — Login volunteer or admin (authenticates against both collections).
* `GET /api/auth/me` — Get current logged-in user details.
* `GET /api/auth/certificate` — Download volunteer registration certificate PDF (Approved volunteers only).

### Drives (`/api/drives`)
* `GET /api/drives` — Get list of all volunteering drives.
* `POST /api/drives` — Create a new volunteering drive (Admin only).
* `PUT /api/drives/:id` — Update drive details (Admin only).
* `DELETE /api/drives/:id` — Delete a drive (Admin only).
* `POST /api/drives/:id/register` — Register current volunteer for a drive.
* `POST /api/drives/:id/unregister` — Unregister current volunteer from a drive.

### Admin Actions (`/api/admin`)
* `GET /api/admin/volunteers` — List all registered volunteers (Admin only).
* `PATCH /api/admin/volunteers/:id/status` — Approve or reject volunteer application (Admin only).
* `GET /api/admin/reports/csv` — Export overall volunteer demographic report as CSV (Admin only).
* `GET /api/admin/reports/pdf` — Export overall volunteer demographics summary as PDF (Admin only).
