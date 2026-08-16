# 🚀 Unmask ATS - AI-Powered Autonomous ATS & Verification Cloud Platform

![Unmask ATS Banner](https://img.shields.io/badge/Unmask-ATS%20Cloud%20Engine-6366f1?style=for-the-badge&logo=rocket)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs)
![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)
![Security](https://img.shields.io/badge/Security-Zero%20Local%20Storage-10b981?style=for-the-badge&logo=shield)

**Unmask ATS** is an industry-grade, cloud-native Applicant Tracking System (ATS) and autonomous AI interview engineering platform. Designed with **zero local file storage reliance**, Unmask ATS streams resumes and logos directly to Cloud Storage, detects AI-generated fake resumes, verifies developer skills using **Abstract Syntax Tree (AST)** GitHub analysis, and conducts proctored AI interview simulations.

---

## 🌟 Architectural Features & The 8 Recruitment Steps

Unmask ATS automates the end-to-end recruitment pipeline across **8 core steps**:

### 1. Step 1: Registration & Cloud Authentication
- **Company Profile**: Onboarding form with cloud logo stream upload.
- **Candidate Profile (4-Step Wizard)**:
  1. Personal credentials & contact details
  2. Experience & education history
  3. GitHub, LinkedIn, LeetCode, and Portfolio profile links
  4. Direct Cloud Resume Dropzone (streamed directly to cloud memory buffer without local disk persistence).
- **Universal Login**: Role-aware login (Company & Candidate) with 7-day JWT tokens, rate limiting (`express-rate-limit`), and `helmet` security.

### 2. Step 2: Role-Based Dashboards
- **Company Dashboard**: Metrics overview (Active Jobs, Evaluated Candidates, Average AI Score, Fake Resumes Flagged), aggregate candidate score heatmaps, job post manager, and candidate shortlisting.
- **Candidate Dashboard**: Profile readiness score, applied job tracker with AI confidence score, technical aspect breakdown (AST complexity, problem solving, communication), and open portal jobs explorer.

### 3. Step 3: Google Form-Style Job Creation & AI JD Generator
- Custom question builder with question importance (mandatory / optional) and question types.
- **AI Job Description Generator**: Automatically generates professional JDs based on role title and required stack.
- **Aspect Weightage Matrix**: Recruiters customize the scoring weight for Technical, Communication, Problem Solving, and Professionalism aspects.
- **Shareable Links & Multi-Platform Publishing**: Generates shareable form links for 1-click publishing to LinkedIn, Indeed, Internshala, etc.

### 4. Step 4: Candidate Application Portal
- Candidates apply seamlessly via custom shareable form links or directly through the platform job portal.
- Submits custom form responses and streams candidate resume directly to Cloud Storage.

### 5. Step 5: AI Resume Parsing & Deep Background Verification
- **Fake Resume Detection**: Evaluates resume veracity score to detect AI-generated fluff or exaggerated claims.
- **GitHub AST & Commit Analysis**: Audits candidate GitHub repositories, inspects Abstract Syntax Tree (AST) code complexity, technology stack usage, and commit history timelines.
- **Online Profile Aggregation**: Fetches LeetCode problem counts and online coding data to compute a composite verification score.

### 6. Step 6: AI Interactive Interview Simulation
- **Proctored AI Interview Agent**: Conducts real-time resume-tailored voice/chat interviews.
- **Adaptive Cross-Questioning**: Asks follow-up questions and introduces intentional trick questions to verify genuine knowledge versus AI-memorized answers.
- **Live Code Editor**: Proctored technical coding environment for real-time coding challenges.
- **Proctored Anti-Cheat System**: Monitors tab switches, suspicious activities, and monitors aspect metrics (confidence, clarity, fluency, professionalism).

### 7. Step 7: Company Evaluation & Shortlist Panel
- **Detailed Candidate Diagnostic Reports**: Comprehensive breakdown of AI observations and score justifications for every candidate.
- **Weighted Heatmaps & Diagram Charts**: Visualizes candidate distribution across weighted job aspects.
- **1-Click Shortlist Generator & Email Dispatch**: Select top candidates with a single click, generate shortlist sheets, and send confirmation emails for next rounds directly from the platform.

### 8. Step 8: Automated Candidate Feedback & Growth Roadmap
- Delivers personalized evaluation reports directly to the candidate's dashboard, detailing aspect scores, strengths, and specific areas for technical growth.

---

## 🛠 Tech Stack

### Backend Infrastructure
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas with Mongoose
- **Cloud Storage**: Cloudinary Memory Buffer Stream (Zero disk writing)
- **Security**: JWT (`jsonwebtoken`), `bcryptjs` (salt 12), `helmet`, `cors`, `express-rate-limit`

### Frontend Application
- **Framework**: React 19 with Vite
- **UI Design System**: Custom Glassmorphism CSS design tokens, smooth gradients, dark mode glass cards
- **Icons & Visuals**: `lucide-react`, `canvas-confetti`
- **API Client**: Axios with automated JWT injection interceptors

---

## 📁 Project Structure

```text
Advance_ats_project/
├── Intellify_project.md       # Project Feature Requirements (8 Steps)
├── README.md                  # Project Documentation
├── backend/
│   ├── config/
│   │   ├── db.js              # Database Connector
│   │   ├── cloudinary.js      # Zero-Disk Cloud Stream Helper
│   │   └── userStore.js       # User Registry & Duplicate Validation
│   ├── controllers/
│   │   ├── authController.js  # Auth & Registration Logic
│   │   ├── companyController.js # Company Dashboard & Jobs
│   │   └── candidateController.js # Candidate Dashboard & Applied Jobs
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT Protection & Role Authorization
│   ├── models/
│   │   ├── Company.js         # Mongoose Company Schema
│   │   ├── Candidate.js       # Mongoose Candidate Schema (4-step profile)
│   │   └── Job.js             # Mongoose Job Schema & Weightage Matrix
│   ├── routes/
│   │   ├── authRoutes.js      # Auth Endpoints
│   │   ├── companyRoutes.js   # Company Endpoints
│   │   └── candidateRoutes.js # Candidate Endpoints
│   ├── .env                   # Environment Variables
│   └── server.js              # Express Server Entrypoint
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/          # Multi-Step Candidate & Company Registration UI
    │   │   ├── dashboard/     # Company & Candidate Dashboards UI
    │   │   ├── landing/       # Project Features & 8-Step Interactive Landing Page
    │   │   └── layout/        # Navbar & Glassmorphism Header
    │   ├── context/
    │   │   └── AuthContext.jsx # Global Authentication State
    │   ├── services/
    │   │   └── api.js         # Axios API Client
    │   ├── App.jsx            # Main App Router & Layout
    │   └── index.css          # Glassmorphism Design System CSS
    └── package.json
```

---

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
*Frontend runs on `http://localhost:5173`*

---

## 🔒 Security & Industry-Grade Standards

1. **Zero Local Storage Guarantee**: All uploads (resumes & logos) stream through memory buffers directly to cloud storage. No files are saved to the server's file system.
2. **Strict Duplicate Email Prevention**: Enforces database and registry duplicate checks to ensure unique account creation.
3. **Resilient Offline Fallback**: Database state checks ensure the server responds instantly without freezing or timing out.
