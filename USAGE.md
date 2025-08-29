# 🚀 Quick Start Guide

## 📋 Prerequisites
- Node.js v16+
- Both servers running (client on port 3010, server on port 3011)

## 🎯 Quick Setup

### 1. Start the Application
```bash
# Terminal 1 - Start Backend Server
cd server && npm run dev

# Terminal 2 - Start Frontend Client  
cd client && npm start
```

### 2. Generate Test User & OTP
```bash
# Easy way - Use the script
./generate-user.sh

# Manual way - Use curl
curl -X POST http://localhost:3011/api/dev/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe", "email":"john@example.com"}'
```

### 3. Login & Vote
1. Open: `http://localhost:3010`
2. Enter your name and email
3. Click "Send Verification Code"
4. Use the OTP from step 2
5. Select candidate and vote!

## 🔧 Development Tools

### Generate User
```bash
./generate-user.sh
```

### Check All Stored OTPs
```bash
curl http://localhost:3011/api/dev/stored-otps
```

### Check System Status
```bash
curl http://localhost:3011/api/dev/status
```

### Clear All OTPs
```bash
curl -X DELETE http://localhost:3011/api/dev/clear-otps
```

## 🎭 User Roles

### Regular Voter
- Use generated OTP to login
- Vote for one candidate
- View results page

### Admin User
1. Generate OTP with admin email: `admin@votingsystem.com`
2. Login normally with OTP
3. Access admin dashboard at `/admin`

## 📱 Access Points

- **Main App**: http://localhost:3010
- **Results**: http://localhost:3010/results  
- **Admin**: http://localhost:3010/admin

## 🎨 UI Changes

✅ **New Professional Design:**
- Clean white cards instead of glass effects
- Professional blue color scheme
- Better typography with Poppins font
- Formal button styles
- Corporate-friendly appearance

## 🔐 Security Features

- OTP expires in 10 minutes
- One vote per email address
- Rate limiting on API endpoints
- Input validation and sanitization
- JWT token authentication

## 🚫 Troubleshooting

**Port conflicts?**
- Client: Change PORT in `client/package.json`
- Server: Change PORT in `server/.env`

**OTP not working?**
- Check if OTP expired (10 min limit)
- Use `./generate-user.sh` to create fresh OTP
- Verify email matches exactly

**Server not starting?**
- Install dependencies: `npm install` in both folders
- Check if ports 3010/3011 are available
- Copy `server/.env.example` to `server/.env`