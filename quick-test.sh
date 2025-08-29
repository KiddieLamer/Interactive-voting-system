#!/bin/bash

echo "========================================="
echo "   🧪 QUICK OTP TEST"
echo "========================================="
echo

# Generate OTP
echo "1. Generating OTP..."
response=$(curl -s -X POST http://localhost:3011/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"Quick Test", "email":"quicktest@example.com"}')

echo "$response"

# Extract OTP from devNote
otp=$(echo "$response" | grep -o 'OTP: [0-9]*' | grep -o '[0-9]*')
echo
echo "🔑 Your OTP: $otp"
echo

# Test verification
echo "2. Testing OTP verification..."
verify_response=$(curl -s -X POST http://localhost:3011/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"quicktest@example.com\", \"otp\":\"$otp\"}")

if echo "$verify_response" | grep -q "token"; then
    echo "✅ OTP verification SUCCESS!"
    echo "📱 Now you can use:"
    echo "   Email: quicktest@example.com"
    echo "   OTP: $otp"
    echo "   At: http://localhost:3010"
else
    echo "❌ OTP verification FAILED!"
    echo "$verify_response"
fi

echo
echo "========================================="