# Finthesia – Personal Finance Platform

A modern fintech platform for budgeting, financial insights, and wealth tracking.

## 🚀 Production Architecture

This project is structured into three main directories for clear separation of concerns, scalability, and ease of deployment.

- **Getting Started**:
  ```bash
  npm install
  npm run dev
  ```
  *(This will run both frontend and backend concurrently from the root)*

### 1️⃣ `/frontend`
- **Tech Stack**: React, Vite, TailwindCSS, Framer Motion.
- **Purpose**: All user-facing UI, dashboards, and authentication screens.
- **Deployment**: Optimized for Vercel or Netlify.
- **Local Dev**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 2️⃣ `/backend`
- **Tech Stack**: Firebase (Cloud Functions, Firestore, Auth).
- **Purpose**: Backend logic, database security rules, and data processing.
- **Local Dev**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```

### 3️⃣ `/docs`
- **Purpose**: Project documentation, API references, Design guidelines, and implementation plans.

---

## 💡 Why This Structure?
✔ **Clean Separation**: Frontend and backend are independent.
✔ **Production-Ready**: Follows startup standards (e.g., Stripe, Ramp style).
✔ **Fast Deployment**: Vercel for UI, Firebase for logic.
