# 💻 Online Complaint Management System — Frontend Client

Modern, responsive web interface for the **Online Complaint Management System (CMS)** built with **React 18**, **Vite**, and **Bootstrap 5**. Features distinct portals for Citizens, Technicians, and Administrators, real-time status tracking, interactive dashboards, and PDF receipt downloads.

---

## 🛠️ Tech Stack

- **Core**: React 18.3, Vite 8
- **Routing**: React Router DOM v7
- **Styling**: Bootstrap 5.3, React-Bootstrap, Custom CSS with responsive layouts
- **HTTP Client**: Axios with automated JWT request interceptor and silent refresh handling
- **State & Data**: TanStack Query (React Query)
- **Data Visualization**: Recharts (Interactive charts for Admin KPI dashboards)
- **Notifications**: React Toastify
- **Icons**: React Icons

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Production backend API base URL (must include /api)
VITE_API_URL=https://complaint-backend.onrender.com/api
```

During local development with the Vite proxy active, `VITE_API_URL` can be left blank or set to `/api` to proxy directly to `http://localhost:8080`.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested with Node 20 and 24)
- npm 9+

### Commands
```bash
# Clone the repository
git clone https://github.com/yenduriveeraneeraj/complaint-frontend.git
cd complaint-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit the app at: `http://localhost:5173`

### Production Build
```bash
npm run build
```
This generates the optimized production bundle inside the `dist/` directory.

---

## ☁️ Deployment Instructions

### Option 1: Render Static Site (100% Free & Fast)
1. Push this repository to GitHub: `https://github.com/yenduriveeraneeraj/complaint-frontend`.
2. Go to [Render Dashboard](https://dashboard.render.com) > Click **New +** > **Static Site**.
3. Connect your `complaint-frontend` repository.
4. Settings:
   - **Name**: `complaint-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-service-name>.onrender.com/api`
6. Under **Redirects/Rewrites**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
7. Click **Create Static Site**.

---

### Option 2: Vercel (Recommended Alternative)
1. Import repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`, Output Directory: `dist`.
4. Environment Variables:
   - `VITE_API_URL`: `https://<your-backend-url>/api`
5. Click **Deploy**. (The included `vercel.json` automatically handles all SPA routing).

---

### Option 3: Netlify
1. Import repository in [Netlify](https://www.netlify.com).
2. Build command: `npm run build`, Publish directory: `dist`.
3. Environment Variables:
   - `VITE_API_URL`: `https://<your-backend-url>/api`
4. Click **Deploy Site**. (The included `public/_redirects` automatically routes all pages to `/index.html`).

---

## 👤 Default System Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@cms.com` | `Admin@123` | Master control, Department & Staff management, Analytics |
| **Technician / Staff** | `staff@cms.com` | `Staff@123` | Staff ticket queue & Resolution portal |
| **Citizen** | `user@cms.com` | `User@123` | Complaint submission, Tracking, Feedback |
