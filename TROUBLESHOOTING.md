# 🔧 Troubleshooting Guide - Plant Disease Detector

## ✅ **ISSUE RESOLVED!**

The blank page issue has been fixed! The problem was in `src/App.jsx` where `handleLogout` was being called before it was declared.

## 🚀 **Your App Should Now Work**

1. **Start the development server:**
   ```bash
   npm run dev:full
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:5173/
   ```

3. **You should now see the Plant Disease Detector homepage!**

---

## 🐛 **Common Issues & Solutions**

### 1. **Blank Page / White Screen**
**✅ FIXED** - This was caused by a JavaScript error in App.jsx

**If it happens again:**
- Check browser console (F12) for JavaScript errors
- Ensure all imports are correct
- Check that all components are properly exported

### 2. **Port Already in Use**
```bash
# Kill all Node.js processes
taskkill /f /im node.exe

# Or use a different port
npm run dev  # This will use a different port automatically
```

### 3. **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 4. **API Errors**
- Check if your `.env` file has the correct Gemini API key
- Ensure backend server is running on port 5000
- Check CORS settings in `backend/server.js`

### 5. **Database Issues**
- Ensure `backend/database.sqlite` file exists
- Check file permissions
- Restart the backend server

---

## 🔍 **How to Debug Issues**

### 1. **Check Browser Console**
- Press F12 in your browser
- Look for red error messages in the Console tab
- Fix any JavaScript errors you see

### 2. **Check Network Tab**
- In F12 Developer Tools, go to Network tab
- Look for failed API requests (red status codes)
- Check if API endpoints are responding

### 3. **Check Backend Logs**
- Look at the terminal where you ran `npm run dev:full`
- Check for any error messages from the backend server

### 4. **Test Components Individually**
- Try navigating to different pages (Dashboard, Login, etc.)
- See which specific component might be causing issues

---

## 📋 **Quick Health Check**

Run these commands to verify everything is working:

```bash
# 1. Check if dependencies are installed
npm list --depth=0

# 2. Check if build works
npm run build

# 3. Check if linting passes (optional)
npm run lint

# 4. Start the development server
npm run dev:full
```

---

## 🌐 **Testing Your Application**

### **Basic Functionality Test:**
1. ✅ Homepage loads
2. ✅ Can navigate to Dashboard
3. ✅ Can register a new account
4. ✅ Can login with credentials
5. ✅ Can upload an image for analysis
6. ✅ AI analysis works and returns results
7. ✅ Can view history (when logged in)
8. ✅ Can generate PDF reports

### **Browser Compatibility:**
- ✅ Chrome (recommended)
- ✅ Edge
- ⚠️ Firefox (voice features limited)
- ⚠️ Safari (voice features limited)

---

## 🔧 **Environment Variables Check**

Make sure your `.env` file contains:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret
```

**Important:** 
- Never commit `.env` file to version control
- Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Use a strong, random JWT_SECRET

---

## 📞 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the exact error message** in browser console
2. **Try in incognito/private browsing mode**
3. **Clear browser cache and cookies**
4. **Try a different browser**
5. **Restart your computer** (sometimes helps with port conflicts)

### **Common Error Messages:**

**"Cannot read properties of undefined"**
- Usually a missing import or undefined variable
- Check the component that's mentioned in the error

**"Network Error" or "Failed to fetch"**
- Backend server might not be running
- Check if `http://localhost:5000/health` responds

**"Module not found"**
- Missing dependency or wrong import path
- Run `npm install` to ensure all packages are installed

---

## ✨ **Performance Tips**

- **Images**: Compress images before uploading for faster analysis
- **Browser**: Use Chrome or Edge for best performance
- **Network**: Ensure stable internet connection for AI analysis
- **Memory**: Close other browser tabs if the app feels slow

---

## 🎯 **Next Steps**

Now that your app is working:

1. **Test all features thoroughly**
2. **Try uploading different plant images**
3. **Test the voice features (microphone button)**
4. **Generate some PDF reports**
5. **When ready, follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy online**

---

**🌱 Your Plant Disease Detector is now ready to help farmers and gardeners identify plant diseases! 🎉**