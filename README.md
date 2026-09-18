# Plant Disease Detector - AI-Powered Agricultural Assistant

A comprehensive full-stack web application that uses advanced AI to help farmers, gardeners, and botanists identify plant diseases with professional-grade accuracy. Built with React, Node.js, and Google's Gemini AI.

## 🌱 Features

- **AI Plant Analysis**: Upload images or use live camera to get instant disease diagnosis
- **Smart Diagnosis**: 7-day treatment roadmaps, visual evidence markers, and environmental insights
- **Voice Interaction**: Speech-to-text input and text-to-speech responses for hands-free operation
- **User Management**: Secure authentication with persistent scan history
- **PDF Reports**: Generate comprehensive treatment reports for both healthy and diseased plants
- **Admin Dashboard**: Monitor platform statistics and manage user data
- **Non-Plant Detection**: Intelligent validation that rejects non-plant images

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   - Ensure `.env` file contains your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

3. **Run the application**
   ```bash
   npm run dev:full
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🛠 Technology Stack

- **Frontend**: React 19 + Vite 8.0.1
- **Backend**: Node.js + Express 5.2.1
- **Database**: SQLite3 6.0.1
- **AI**: Google Gemini API (gemini-2.5-flash-lite)
- **Authentication**: JWT + bcryptjs
- **PDF Generation**: jsPDF + jspdf-autotable
- **Icons**: Lucide React

## 📁 Project Structure

```
projectplant/
├── backend/
│   ├── database.js          # SQLite database setup
│   ├── database.sqlite      # Database file
│   └── server.js            # Express API server
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/            # API and AI services
│   ├── hooks/               # Custom React hooks
│   └── styles/              # CSS files
├── public/                  # Static assets
└── docs/                    # Documentation files
```

## 🔧 Available Scripts

- `npm run dev` - Start frontend only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Documentation

- [Project Documentation](Project_Documentation.md) - Complete technical documentation
- [How to Run](HOW_TO_RUN.txt) - Detailed setup and usage guide
- [SQL Commands](SQL_COMMANDS.txt) - Database management commands

## 🎯 Usage

1. **Guest Mode**: Try the plant analyzer without registration
2. **Registered User**: Create account to save scan history and generate reports
3. **Admin Access**: Use username "admin" for administrative features

## 🔒 Browser Compatibility

For optimal voice features, use:
- Google Chrome (recommended)
- Microsoft Edge
- Ensure microphone permissions are enabled

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or support, refer to the documentation files.
