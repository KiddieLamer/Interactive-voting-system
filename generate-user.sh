#!/bin/bash

echo "========================================="
echo "   Digital Voting System - User Setup"
echo "========================================="
echo

# Check if server is running
if ! curl -s http://localhost:3011/api/dev/status > /dev/null; then
    echo "❌ Server is not running on port 3011"
    echo "Please start the server first: cd server && npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo

# Get user input
read -p "Enter your full name: " name
read -p "Enter your email: " email

echo
echo "Generating OTP for user..."

# Generate OTP
response=$(curl -s -X POST http://localhost:3011/api/dev/generate-otp \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$name\", \"email\":\"$email\"}")

# Check if successful
if echo "$response" | grep -q "error"; then
    echo "❌ Error: $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
    exit 1
fi

# Extract OTP
otp=$(echo "$response" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)

echo "========================================="
echo "   🎉 USER CREATED SUCCESSFULLY"
echo "========================================="
echo "Name: $name"
echo "Email: $email" 
echo "OTP Code: $otp"
echo "Valid for: 10 minutes"
echo
echo "📝 Next Steps:"
echo "1. Open: http://localhost:3010"
echo "2. Enter your name and email"
echo "3. Click 'Send Verification Code'"
echo "4. Use this OTP: $otp"
echo
echo "🔐 Note: This is for testing only."
echo "    In production, OTP would be sent via email."
echo "========================================="