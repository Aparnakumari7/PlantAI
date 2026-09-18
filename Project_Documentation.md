# Plant Disease Detector: Full Stack Architecture & Project Documentation

## 1. Project Overview
The **Plant Disease Detector** is a comprehensive full-stack, AI-powered agricultural web application designed to help farmers, gardeners, and botanists identify plant diseases with professional-grade accuracy. The application provides instant diagnosis, severity classification, detailed treatment plans, and comprehensive care instructions through an intuitive interface.

Built as a modern web application, it features a React frontend with Node.js backend, authenticated user sessions, persistent scan history via SQLite database, comprehensive admin monitoring, and advanced AI-powered diagnostic capabilities.

---

## 2. Technology Stack
- **Frontend Framework**: React 19 (via Vite 8.0.1)
- **Routing**: `react-router-dom` v7.14.0
- **Styling**: Modern CSS with custom properties and responsive design
- **Backend Environment**: Node.js with Express.js 5.2.1
- **Database**: SQLite3 v6.0.1 with relational schema
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` for secure password hashing
- **Artificial Intelligence**: Google Gemini API (`@google/genai` v1.48.0) utilizing `gemini-2.5-flash-lite` model
- **PDF Generation**: jsPDF v4.2.1 with jspdf-autotable for comprehensive reports
- **Icons**: Lucide React v1.7.0 for modern iconography
- **Development**: Concurrent development with hot reload support

---

## 3. Core Features

### A. AI Plant Analyzer
Located primarily in the `Dashboard.jsx` interface, the core feature allows a user to interact with three input modes:
- **Image Upload**: Users can browse and upload high-resolution images of affected leaves or stems.
- **Live Camera Feature**: Directly hooks into the device's camera to take real-time photos of plants.
- **Text Prompt**: Allows users to manually type out agricultural symptoms.
The inputs are converted to Base64 (if images) and transmitted to the Gemini API (`aiService.js`), which is programmed with a highly tailored master-prompt instructing it to act as a 30-year veteran botanist.

### B. Smart Diagnosis Suite (Premium Features)
- **7-Day Treatment Roadmap**: AI generates a structured recovery timeline for every diagnosed disease.
- **Visual Evidence Markers**: The system identifies and lists the exact visual cues it used for the diagnosis, improving user transparency.
- **Smart Context Assistant**: Users can provide environmental factors (weather, plant age, environment) to significantly enhance diagnostic accuracy.
- **Environmental Insight**: Real-time analysis of how current weather or plant age contributes to the specific leaf symptoms.

### C. Voice-to-Voice Conversational Suite
- **English Language Support**: Fully optimized for English language, including both UI and voice services.
- **Speech Interaction**: Dedicated microphone button in the ChatBot for natural language processing of user questions.
- **Conversational Voice Mode**: When enabled, the AI reads responses aloud and waits for user follow-up questions, creating a hands-free "walkie-talkie" experience.
- **Audio Summaries**: One-tap audio playback of the full diagnosis and treatment roadmap in the `ResultDisplay` component.
- **Non-Plant Detection**: Advanced AI validation that detects and rejects non-plant images (animals, people, objects, buildings) with user-friendly error messages.

### D. Registered User Flow & Persistence
- **Guest Access**: Users can utilize the Plant Analyzer free via the Home page. Data is discarded after the session.
- **Registered Users**: A dedicated SQLite backend tracks user credentials and permanently saves scan history, including AI diagnostics, treatment roadmap, and visual markers.
- **History Management**: Users can view and delete their own scan history, with admin users having the ability to delete any user's scans.
- **PDF Report Generation**: Comprehensive PDF reports can be generated for both healthy and diseased plant diagnoses, including treatment recommendations and visual evidence.

### E. Admin Monitoring System
Accounts with the `is_admin` flag (e.g., username `admin`) can access a secured telemetry route:
- Aggregate statistics (Total Users, Lifetime Scans).
- Performance metrics (Healthy vs Diseased scan ratio).
- Real-time global tracking of trending plant diseases.
- Administrative controls to delete any user's scan history for data management.

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
* **`hooks/`**:
    * `useVoice.js`: Centralized logic for browser-based speech recognition and synthesis.
* **`services/apiService.js`**: Functions as the HTTP middleware for backend communication. 
* **`services/aiService.js`**: Functions as the AI middleware, housing advanced prompt engineering and "Smart Context" integration.

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
