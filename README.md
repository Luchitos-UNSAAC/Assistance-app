# 🐾 LUCHOS UNSAAC - Volunteer Management Platform

**A platform for managing canine care volunteers at UNSAAC (Universidad Nacional de San Antonio Abad del Cusco)**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-orange)](https://zustand-demo.pmnd.rs/)

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Main Features](#-main-features)
- [System Architecture](#-system-architecture)
- [User Roles](#-user-roles)
- [Detailed Functionalities](#-detailed-functionalities)
- [Technologies Used](#-technologies-used)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [API & Endpoints](#-api--endpoints)
- [Database](#-database)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)
- [License](#-license)

---

## 📖 Overview
**LUCHOS UNSAAC** is a mobile-first web platform designed to manage volunteers dedicated to the welfare of dogs at UNSAAC. It simplifies the organization, monitoring, and administration of volunteer activities related to canine care.

### 🎯 Main Goals
- **Efficient Management:** Centralized management of volunteers and their activities.
- **Attendance Tracking:** Monitor participation and engagement.
- **Mobile Access:** Optimized interface for mobile devices.
- **Role Control:** Role-based access permissions.
- **Enhanced UX:** Smooth and friendly UI/UX with animations.

---

## 🚀 Main Features

### 🔐 Authentication
- Secure login with credentials.
- Role-based access control.
- Persistent sessions using Zustand.
- Demo accounts for testing.

### 🧑‍🤝‍🧑 User Roles
- **Volunteer:** Limited access to personal profile and attendance.
- **Manager:** Volunteer management and attendance registration.
- **Admin:** Full system control and configurations.

### 📱 Mobile-First Design
- Responsive design.
- Bottom navigation optimized for mobile.
- Fast loading performance.

### 🎨 Visual Experience
- Smooth animations with Tailwind CSS.
- Gradient themes (purple/pink).
- Interactive hover and transition effects.

---

## 🏗 System Architecture
```plaintext
Web/Mobile Client
 ├─ Next.js App Router
 ├─ React Components
 ├─ Zustand Store
 ├─ Tailwind CSS
 ├─ Role-based Guards
 ├─ Mock Database (Volunteers, Attendance, Users)
```

## 👥 User Roles

### VOLUNTEER
- ✅ View personal profile.
- ✅ Check attendance history.
- ❌ No access to manage other volunteers.

### MANAGER
- ✅ All volunteer features.
- ✅ Create, edit, and delete volunteers.
- ✅ Register attendance.
- ❌ No access to system configurations.

### ADMIN
- ✅ All manager features.
- ✅ System configuration.
- ✅ Role and permission management.

---

## 📌 Detailed Functionalities

### Dashboard
- **Volunteer Dashboard:** Personal stats, attendance, upcoming birthdays.
- **Manager/Admin Dashboard:** Global stats, volunteer tracking, attendance overview.

### Volunteer Management
- Real-time search and filtering.
- Detailed profiles with contact information.
- Attendance statistics per volunteer.

### Attendance System
- Register attendance (Present, Absent, Justified).
- Filter attendances by date and status.
- Quick actions for edit and delete.

---

## 🛠 Technologies Used

### Frontend
- Next.js 14.2.5  
- React 18  
- TypeScript 5  

### Styling & UI
- Tailwind CSS 3.4  
- Shadcn/UI  
- Lucide React  

### State Management
- Zustand 4.4  

### Utilities
- date-fns  
- clsx  
- class-variance-authority  

---

## ⚙ Installation & Setup

### Prerequisites
```bash
Docker (for database)
Node.js >= 22.17.8
pnpm >= 9
Git
```

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Luchitos-UNSAAC/Assistance-app.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd luchos-unsaac
   ```
3. **Install pnpm:**
    ```bash
    npm install -g pnpm
    ```
4. **Verify:**
    ```bash
   pnpm -v
   ```
5. **Install dependencies:**
    ```bash
   pnpm install
   ```

6. **Create db from docker:**
   ```bash
   cd ./dev-tools/docker-compose && docker compose up -d
   ```
7. **Create a `.env` file:**
   - Copy the `.env.example` to `.env`
8. **Run migrations (if applicable):**
   ```bash
    pnpm prisma migrate dev --name init
    ```
9. **Generate Prisma Client:**
   ```bash
    pnpm prisma generate
    ```
10. **Seed the database:**
    ```bash
    node ./prisma/scripts/seed.js
    ```

5. **Run the development server:**
   ```bash
    pnpm dev
    ```
Readme updated