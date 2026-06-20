# ServeTogether — Volunteer Registration System

> A comprehensive volunteer registration and management system for **Nayepankh Foundation**

🤝 ServeTogether is a full-stack web application that enables volunteers to register, discover events, track attendance, earn certificates, and get recognized for their contributions. It provides admins with powerful tools to manage volunteers, events, attendance, and generate reports.

---

## 📋 Features

### 1. Volunteer Registration & Login
- Multi-step registration with skills, availability, and emergency contacts
- JWT-based authentication with role-based access (admin/volunteer)
- Password reset via email
- Profile photo, ID proof, and resume uploads

### 2. Event Management
- Create, update, delete events (admin)
- Browse and filter events by category, city, skills, date
- Register/cancel event participation
- QR code generation for attendance

### 3. Volunteer Dashboard
- Overview of hours, events, points, certificates
- Upcoming events list
- Recent activity tracking
- Badge display

### 4. Admin Dashboard
- Total stats (volunteers, events, hours, pending approvals)
- Approve/reject volunteer registrations
- Gender, skills, city, age distribution charts
- Quick navigation to all admin sections

### 5. Skills-Based Registration
- 20+ predefined skills to choose from
- Skills matching for event recommendations
- Skills distribution analytics

### 6. Availability Calendar
- Weekday/weekend + morning/afternoon/evening preferences
- Availability matching for event suggestions

### 7. QR Code Attendance
- QR code generation per event (24-hour validity)
- Self check-in, manual check-in, QR check-in
- Admin manual check-in/check-out

### 8. Certificate Generation
- Auto-generated PDF certificates with PDFKit
- Nayepankh Foundation branding and decorative borders
- Certificate ID format: NP-CERT-YYYY-XXXX
- Bulk certificate generation for events
- Download and preview certificates

### 9. Notifications
- In-app notification system
- Unread count badge
- Mark as read / mark all as read
- Email notifications for registration, approval, events

### 10. Leaderboard & Gamification
- Points system for volunteer contributions
- Badges for milestones
- Top 3 highlight display
- Filterable by time period (all/monthly/weekly)

### 11. Feedback System
- Volunteer feedback (rating + comment) per event
- Organizer feedback on volunteers
- Feedback statistics per event

### 12. Emergency Contacts
- Emergency contact details during registration
- Visible in admin volunteer detail view

### 13. Search & Filter
- Search volunteers by name, email, skills, city, status
- Search events by title, category, city, date, skills
- Filter attendance by status, method

### 14. Reports & Export
- Overview, volunteer, event, attendance reports
- CSV export for volunteers, events, attendance
- Date range filtering

### 15. Email Confirmations
- Registration confirmation email
- Approval/rejection notification email
- Event registration/reminder emails
- Certificate availability notification
- Thank you email after event completion

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| File Uploads | Cloudinary + Multer |
| PDF Certificates | PDFKit |
| QR Attendance | qrcode library |
| Email | Nodemailer |
| State Management | React Context API |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | react-icons (Feather) |
| QR Display | react-qr-code |
| Date Utils | date-fns |

---

## 📁 Project Structure

```
ServeTogether/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── models/
│   │   ├── Volunteer.js
│   │   ├── Event.js
│   │   ├── Attendance.js
│   │   ├── Certificate.js
│   │   ├── Feedback.js
│   │   └── Notification.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── volunteers.js
│   │   ├── events.js
│   │   ├── attendance.js
│   │   ├── certificates.js
│   │   ├── feedback.js
│   │   ├── notifications.js
│   │   └── admin.js
│   └── utils/
│       ├── certificateGenerator.js
│       ├── emailSender.js
│       ├── csvExport.js
│       ├── qrCodeGenerator.js
│       └── cloudinaryUpload.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── VolunteerDashboard.jsx
│   │       ├── Profile.jsx
│   │       ├── Events.jsx
│   │       ├── EventDetail.jsx
│   │       ├── Leaderboard.jsx
│   │       ├── Certificates.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminEvents.jsx
│   │       ├── AdminVolunteers.jsx
│   │       ├── AdminReports.jsx
│   │       ├── AdminAttendance.jsx
│   │       └── ResetPassword.jsx
├── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for file uploads)
- Gmail account (for sending emails, or other SMTP)

### ⚡ Quick Start (Combined Run)

You can verify/install all dependencies and run both the frontend and backend concurrently using the root runner:

**On Windows:**
Simply run the `run.bat` file in the root directory:
```bash
.\run.bat
```

**On macOS / Linux / Git Bash:**
Make `run.sh` executable and run it:
```bash
chmod +x run.sh
./run.sh
```

**Using npm:**
If you prefer running via npm:
```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Start the dev servers concurrently
npm run dev
```

### 1. Backend Setup

```bash
cd ServeTogether/backend
npm install
```

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/servetogether?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Nodemailer (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=ServeTogether <your-email@gmail.com>

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
# Development
npm run dev

# Production
npm start
```

### 2. Frontend Setup

```bash
cd ServeTogether/frontend
npm install
```

Create a `.env` file (optional, defaults to localhost:5000):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Create First Admin

After starting the backend, you need to create the first admin user. You can do this by:

**Option A:** Register a volunteer through the UI, then manually update their role in MongoDB to `admin`.

**Option B:** Use the admin creation endpoint (requires an existing admin token):

```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <existing-admin-token>" \
  -d '{"name":"Admin Name","email":"admin@nayepankh.org","password":"admin123","phone":"9876543210"}'
```

**Option C (Recommended for first setup):** Temporarily remove the admin-only middleware from the create-admin route, create your admin, then restore the middleware.

---

## 🔐 API Routes Overview

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register new volunteer |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/updatepassword` | PUT | Update password |
| `/api/auth/forgotpassword` | POST | Forgot password email |
| `/api/auth/resetpassword/:token` | PUT | Reset password |
| `/api/volunteers` | GET | List volunteers (search/filter) |
| `/api/volunteers/leaderboard` | GET | Leaderboard |
| `/api/volunteers/profile` | PUT | Update profile |
| `/api/events` | GET | List events (filter) |
| `/api/events/upcoming` | GET | Upcoming events |
| `/api/events` | POST | Create event (admin) |
| `/api/events/:id/register` | POST | Register for event |
| `/api/events/:id/cancel` | POST | Cancel registration |
| `/api/attendance/checkin` | POST | Check in |
| `/api/attendance/checkout` | POST | Check out |
| `/api/attendance/my` | GET | My attendance |
| `/api/certificates` | GET | My certificates |
| `/api/certificates/:id/download` | GET | Download PDF |
| `/api/feedback/volunteer` | POST | Submit volunteer feedback |
| `/api/notifications` | GET | Get notifications |
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/admin/volunteers/pending` | GET | Pending volunteers |
| `/api/admin/export/volunteers` | GET | Export CSV |

---

## 🎨 Design

- **Primary Color:** #2E86AB (Blue)
- **Secondary Color:** #A23B72 (Purple)
- **Accent Color:** #F18F01 (Orange)
- **Font:** Poppins (Google Fonts)
- **Responsive:** Mobile-first design with breakpoints at 480px, 768px, 1024px

---

## 📝 License

This project is developed for **Nayepankh Foundation**. All rights reserved.

---

## 🙏 Acknowledgments

- Built with ❤️ for the Nayepankh Foundation volunteer community
- ServeTogether — Empowering volunteers to make a difference together
