# PlantAI
# Plant Disease Detector: Full Stack Architecture & Project Documentation

## 1. Project Overview
The **Plant Disease Detector** is a full-stack, AI-powered agricultural web application designed to help farmers, gardeners, and botanists identify plant diseases accurately. By uploading a photo of a plant, the application instantly provides a diagnosis, severity classification, and specific care instructions (including both chemical treatments and organic home remedies). 

The application has been recently transformed from a simple React Single Page Application (SPA) into a robust Full-Stack environment featuring a Node.js API, authenticated user sessions, persistent scan history via SQLite, and an Admin Monitoring Dashboard.

---

## 2. Technology Stack
- **Frontend Framework**: React 19 (via Vite)
- **Routing**: `react-router-dom` (v6+)
- **Styling**: Vanilla CSS injected alongside standard layout classes.
- **Backend Environment**: Node.js with Express.js
- **Database**: SQLite3
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` for secure password hashing.
- **Artificial Intelligence**: Google Gemini API (`@google/genai`) utilizing the `gemini-2.5-flash` model.

---

## 3. Core Features

### A. AI Plant Analyzer
Located primarily in the `Dashboard.jsx` interface, the core feature allows a user to interact with three input modes:
- **Image Upload**: Users can browse and upload high-resolution images of affected leaves or stems.
- **Live Camera Feature**: Directly hooks into the device's camera to take real-time photos of plants.
- **Text Prompt**: Allows users to manually type out agricultural symptoms.
The inputs are converted to Base64 (if images) and transmitted to the Gemini API (`aiService.js`), which is programmed with a highly tailored master-prompt instructing it to act as a 30-year veteran botanist.

### B. Guest vs. Registered User Flow
- **Guests**: Users can utilize the Plant Analyzer completely free via the Home page ("Try It Now"). Their diagnosis runs optimally but data is discarded immediately after the session to protect privacy.
- **Registered Users**: A dedicated SQLite backend securely tracks user credentials. When an authenticated user scans a plant, the metadata of the scan—including the cropped image, diagnosis name, overall plant health, confidence metric, and treatment guidelines—are saved permanently in their **History**.

### C. Admin Monitoring System
Accounts can be elevated to Platform Administrators (achievable by registering with the reserved `admin` username). Admins are granted access to a secured `/admin` route which displays:
- Aggregate platform statistics (Total Users, Total Lifetime Scans).
- AI Performance metrics (Healthy vs Diseased scan ratio).
- A Global Tracking Table showing the 50 most recent uploads, pinpointing exactly what diseases are trending across the user base.

---

## 4. Application Architecture

### Frontend Directory Structure (`src/`)
* **`main.jsx` & `App.jsx`**: The core entry points. `App.jsx` manages the `<Routes>` layer, establishing paths for `/`, `/dashboard`, `/login`, `/register`, `/history`, `/profile`, and `/admin`.
* **`pages/`**:
  * `Home.jsx`: The marketing hero landing page.
  * `Dashboard.jsx`: The Plant Analyzer interface.
  * `Login.jsx` & `Register.jsx`: Authentication interfaces.
  * `History.jsx` & `Profile.jsx`: User-specific data and stat aggregators.
  * `AdminDashboard.jsx`: Exclusive admin-only telemetry grid.
* **`components/`**: Reusable modular parts like the `Header`, `DetectorTabs`, `ResultDisplay`, `CameraFeature`, and `ChatBot`.
* **`services/apiService.js`**: Functions as the HTTP middleware, standardizing API requests to the backend while automatically attaching the `Authorization: Bearer <token>` payloads. 
* **`services/aiService.js`**: Functions as the AI middleware, housing the massive engineering prompts directed at the Google Gemini brain.

### Backend Infrastructure (`backend/`)
* **`server.js`**: An Express server listening locally on Port `5000`. Acts as the central traffic router processing incoming POST/GET requests. Engineered with increased JSON payload limits (`10mb`) to handle raw Base64 image transportation safely.
* **`database.js`**: The SQLite schema initializer. 

---

## 5. Database Schema (SQLite)

The local flat-file database `database.sqlite` uses relational structures:

### `users` Table
Stores authenticated credentials and permission roles.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `username` | TEXT | UNIQUE, NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL (Hashed) |
| `is_admin` | BOOLEAN | DEFAULT 0 |
| `created_at`| DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `predictions` Table
Acts as the global data lake tying AI sessions back to the users who initiated them.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `user_id` | INTEGER | FOREIGN KEY (`users.id`), NOT NULL |
| `plant_name` | TEXT | The identified species |
| `is_healthy` | BOOLEAN | Result state |
| `plant_confidence`| REAL | Confidence % |
| `disease_name` | TEXT | Nullable if plant is healthy |
| `treatment` | TEXT | Extracted organic or chemical remedies |
| `image_path` | TEXT | The Base64 image payload or path URL |
| `timestamp` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

---

## 6. How To Run the Application Locally

The project utilizes `concurrently` in `package.json` to seamlessly spin up both the Vite frontend environment and the Node API backend server simultaneously.

**Launch Command:**
```bash
npm run dev:full
```

- **Frontend Access**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
