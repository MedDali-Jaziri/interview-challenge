# 🏥 Healthcare Management Platform

A full-stack, production-ready system to manage Patients, Medications, and Treatment Assignments in a clinical workflow. This project leverages **NestJS** for the backend API, **Next.js** for the frontend, and **Docker** for deployment.

---

## 📚 Table of Contents

- [Features](#features)
- [Backend Overview](#backend-overview)
- [Frontend Overview](#frontend-overview)
- [Testing Report](#testing-report)
- [Tech Stack](#tech-stack)
- [Dockerized Deployment](#dockerized-deployment)
- [How to Run in Production](#how-to-run-in-production)
- [Author](#author)

---

## ✨ Features

- 🧑‍⚕️ Patient & Medication Management  
- 💊 Assignment of medications to patients  
- 📈 Dashboard with clinical insights  
- 🔐 Authentication with role-based access (Admin, Doctor, Nurse)  
- 🔔 Smart notifications (overdue, success)  
- ⚙️ Settings page for user management and preferences  
- 📦 Fully containerized with Docker  
- 🧪 Unit and API testing using Jest, Postman, cURL  

---

## 🛠 Backend Overview

### ✅ PatientController & Service

- `POST /patients` — Add a patient  
- `GET /patients` — List all patients  
- `GET /patients/:id` — Retrieve one patient  
- `PUT /patients/:id` — Update patient info  
- `DELETE /patients/:id` — Delete patient  

### 💊 MedicationController & Service

- `POST /medications`  
- `GET /medications`  
- `GET /medications/:id`  
- `PUT /medications/:id`  
- `DELETE /medications/:id`  

### 🔗 AssignmentController & Service

- `POST /assignments` — Assign a medication to a patient  
- `GET /assignments` — List all assignments  
- `GET /assignments/:id` — View assignment details  
- `PUT /assignments/:id` — Update assignment duration  
- `DELETE /assignments/:id` — Delete assignment  
- `GET /assignments/remaining-days` — Calculate remaining treatment days  

### 🧰 Utility

- `getPatientRemainingDays(name, dateOfBirth)` — Internal helper for remaining days  

---

## 💻 Frontend Overview

Built with **Next.js 14**, **React 18**, and **Tailwind CSS**.

### 🔐 Authentication & Role-Based Access

- Login with secure session persistence  
- Roles: Admin, Doctor, Nurse  
- UI adapts per role (guarded routes, dashboards)  

### 👨‍⚕️ Patient & Medication UI

- Add/edit/delete patients and medications  
- Real-time search  
- Category-based medication stats  

### 📅 Treatment Assignment UI

- Assign medication with dates  
- Track progress & overdue status  
- Visual status indicators  

### 📊 Dashboard & Notifications

- Realtime counters (Active, Completed, Overdue)  
- Clinical insights per role  
- Alerts with navigation  

### ⚙️ Settings

- Profile update  
- Password change with validation  
- Light/Dark mode support  

---

## 🧪 Testing Report

### ✅ Unit Testing

- Covered: `PatientService`, `MedicationService`, `AssignmentService`  
- Framework: **Jest**  
- Mocked DB with `getRepositoryToken()`  
- Validated:
  - CRUD logic  
  - Remaining days calculation  
  - DTO validations  
  - Edge cases (invalid IDs, errors)  

### 🧪 API Testing

- Tools: **Postman**, **cURL**  
- Sample command:

```bash
curl --request PUT 'http://localhost:8080/assignment/assignment-update/3' --header 'Content-Type: application/json' --data '{
  "startDate": "2025-07-09",
  "numberOfDays": 3
}'
```

---

## 🧰 Tech Stack

| Layer      | Technologies Used                      |
|------------|----------------------------------------|
| Frontend   | Next.js, React, Tailwind CSS, Radix UI |
| Backend    | NestJS, TypeORM, SQLite                |
| Auth       | Session + Role-based Guards            |
| Testing    | Jest, Postman, cURL                    |
| Deployment | Docker, Docker Compose                 |

---

## 🐳 Dockerized Deployment

Both frontend and backend are dockerized and orchestrated with **docker-compose**.

---

## 🧱 Folder Structure

```bash
project-root/
│
├── backend/        # NestJS API
│   ├── Dockerfile
│   └── database.sqlite
│
├── frontend/       # Next.js App
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 How to Run in Production

### 🔧 Prerequisites

- Docker installed  
- Docker Compose installed  

### 🏗️ Build Docker Images

**Backend:**

```bash
cd backend
docker build -t meddali/interview-oxyera-challenge-back-end:0.0.1 .
```

**Frontend:**

```bash
cd frontend
docker build -t meddali/interview-oxyera-challenge-front-end:0.0.1 .
```

### 🧪 Run with Docker Compose

From the root directory:

```bash
docker-compose up -d
```

### 🌐 Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend API: [http://localhost:8080](http://localhost:8080)  

---

## 👨‍💻 Author

**Mohamed Ali Jaziri**  
Software Engineer  
[GitHub](https://github.com/MedDali-Jaziri) | [LinkedIn](https://www.linkedin.com/in/dalijaziri/)