const express = require('express');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/email');
const router = express.Router();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/request-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (global.activeVoters.has(email)) {
      return res.status(400).json({ error: 'You have already voted!' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    global.otpStore.set(email, {
      otp,
      name,
      expiresAt,
      attempts: 0
    });

    // In development mode, skip email sending
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 DEV MODE - OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'OTP generated successfully (development mode)',
        devNote: `OTP: ${otp} - Check server console or use /api/dev/generate-otp instead`
      });
    }
    
    // In production, send email
    const emailSent = await sendOTP(email, otp, name);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpData = global.otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ error: 'No OTP request found for this email' });
    }

    if (Date.now() > otpData.expiresAt) {
      global.otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (otpData.attempts >= 3) {
      global.otpStore.delete(email);
      return res.status(400).json({ error: 'Too many failed attempts' });
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const token = jwt.sign(
      { 
        email, 
        name: otpData.name,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    global.otpStore.delete(email);

    res.json({ 
      token, 
      user: { 
        email, 
        name: otpData.name 
      } 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;