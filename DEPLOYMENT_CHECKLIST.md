# 🚀 Deployment Checklist for Plant Disease Detector

## Pre-Deployment ✅

### Environment Setup
- [ ] **API Key**: Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] **Environment Variables**: Create `.env` file with:
  ```env
  VITE_GEMINI_API_KEY=your_actual_api_key
  NODE_ENV=production
  JWT_SECRET=your_super_secure_random_string
  ```
- [ ] **Dependencies**: Run `npm install` to ensure all packages are installed
- [ ] **Build Test**: Run `npm run build` to test if build works locally
- [ ] **Local Test**: Run `npm run preview` to test built version

### Code Preparation
- [ ] **CORS Configuration**: Update allowed origins in `backend/server.js` with your domain
- [ ] **Database**: Ensure `backend/database.sqlite` exists and is accessible
- [ ] **Error Handling**: Test all features work correctly
- [ ] **Security**: Verify JWT_SECRET is strong and unique

---

## Deployment Options 🎯

### Option 1: Vercel (Easiest - Recommended for beginners)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel`
- [ ] Set environment variables in Vercel dashboard
- [ ] Test deployed application

### Option 2: Netlify + Backend Service
- [ ] Build frontend: `npm run build`
- [ ] Deploy `dist/` folder to Netlify
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Update frontend API URLs to point to backend service
- [ ] Test full application

### Option 3: VPS (DigitalOcean, AWS, etc.)
- [ ] Server setup (Node.js, PM2, Nginx)
- [ ] Clone repository to server
- [ ] Run deployment script: `./deploy.sh`
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure domain DNS

### Option 4: Docker
- [ ] Install Docker and Docker Compose
- [ ] Build image: `docker build -t plant-detector .`
- [ ] Run with compose: `docker-compose up -d`
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL and domain

---

## Post-Deployment Testing 🧪

### Functionality Tests
- [ ] **Homepage**: Loads correctly
- [ ] **Registration**: Can create new account
- [ ] **Login**: Can login with credentials
- [ ] **Image Upload**: Can upload and analyze plant images
- [ ] **Camera**: Camera feature works (on HTTPS)
- [ ] **Voice**: Microphone and voice features work
- [ ] **PDF Generation**: Can generate and download reports
- [ ] **History**: Can view and delete scan history
- [ ] **Admin**: Admin dashboard works (if applicable)

### Performance Tests
- [ ] **Load Time**: Pages load within 3 seconds
- [ ] **Image Processing**: AI analysis completes within 30 seconds
- [ ] **Mobile**: Works on mobile devices
- [ ] **Different Browsers**: Test on Chrome, Firefox, Safari, Edge

### Security Tests
- [ ] **HTTPS**: Site loads over HTTPS
- [ ] **Authentication**: Cannot access protected routes without login
- [ ] **API Security**: Cannot access other users' data
- [ ] **File Upload**: Only accepts image files

---

## Monitoring & Maintenance 📊

### Set Up Monitoring
- [ ] **Health Checks**: `/health` endpoint responds correctly
- [ ] **Error Logging**: Check application logs regularly
- [ ] **Database Backups**: Set up automated SQLite backups
- [ ] **SSL Certificate**: Monitor expiration dates
- [ ] **API Usage**: Monitor Gemini API usage and quotas

### Regular Maintenance
- [ ] **Dependencies**: Update npm packages monthly
- [ ] **Security**: Run `npm audit` and fix vulnerabilities
- [ ] **Database**: Clean up old data if needed
- [ ] **Logs**: Rotate and clean up log files
- [ ] **Performance**: Monitor response times and optimize

---

## Troubleshooting 🔧

### Common Issues & Solutions

#### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### API Not Working
- Check CORS settings in `backend/server.js`
- Verify environment variables are set
- Check network connectivity to Gemini API

#### Database Issues
- Ensure SQLite file has correct permissions
- Check if database file exists
- Verify database schema is correct

#### SSL/HTTPS Issues
- Use Let's Encrypt for free SSL certificates
- Ensure all API calls use HTTPS in production
- Check mixed content warnings in browser

---

## Quick Commands Reference 📝

### Development
```bash
npm install              # Install dependencies
npm run dev:full        # Run development server
npm run build           # Build for production
npm run preview         # Preview production build
```

### Production (VPS)
```bash
./deploy.sh             # Run deployment script
pm2 status              # Check application status
pm2 logs                # View logs
pm2 restart all         # Restart application
```

### Docker
```bash
docker-compose up -d    # Start containers
docker-compose logs -f  # View logs
docker-compose down     # Stop containers
```

---

## Support & Resources 📚

### Documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [HOW_TO_RUN.txt](./HOW_TO_RUN.txt) - Local development guide
- [Project_Documentation.md](./Project_Documentation.md) - Technical documentation

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/) - Free SSL certificates

---

## Emergency Contacts 🆘

If something goes wrong:
1. Check the logs first (`pm2 logs` or `docker-compose logs`)
2. Verify environment variables are set correctly
3. Test the application locally
4. Check your hosting platform's status page
5. Review this checklist for missed steps

---

**Remember**: Always test your deployment in a staging environment before going live! 🚀