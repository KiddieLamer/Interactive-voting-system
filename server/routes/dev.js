const express = require('express');
const router = express.Router();

// Development route - only enabled in development mode
if (process.env.NODE_ENV === 'development') {
  
  // Route to generate OTP for testing
  router.post('/generate-otp', (req, res) => {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if already has active OTP
    if (global.activeVoters.has(email)) {
      return res.status(400).json({ error: 'You have already voted!' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory
    global.otpStore.set(email, {
      otp,
      name,
      expiresAt,
      attempts: 0
    });

    // Return OTP for testing (in production, this would be sent via email)
    res.json({
      message: 'OTP generated for testing',
      email,
      name,
      otp, // Only in development!
      expiresIn: '10 minutes',
      testingNote: 'Use this OTP in the application. In production, this would be sent via email.'
    });
  });

  // Route to check stored OTPs
  router.get('/stored-otps', (req, res) => {
    const otps = [];
    for (const [email, data] of global.otpStore.entries()) {
      otps.push({
        email,
        name: data.name,
        otp: data.otp,
        expiresAt: new Date(data.expiresAt).toISOString(),
        attempts: data.attempts,
        expired: Date.now() > data.expiresAt
      });
    }
    
    res.json({
      totalOTPs: otps.length,
      otps,
      note: 'This endpoint is only available in development mode'
    });
  });

  // Route to clear all OTPs
  router.delete('/clear-otps', (req, res) => {
    global.otpStore.clear();
    res.json({ message: 'All OTPs cleared' });
  });

  // Route to get app status
  router.get('/status', (req, res) => {
    res.json({
      mode: 'development',
      server: 'running',
      uptime: process.uptime(),
      totalVotes: Object.values(global.votes).reduce((sum, v) => sum + v.count, 0),
      activeVoters: global.activeVoters.size,
      pendingOTPs: global.otpStore.size
    });
  });

} else {
  // In production, return 404 for all dev routes
  router.all('*', (req, res) => {
    res.status(404).json({ error: 'Development endpoints not available in production' });
  });
}

module.exports = router;