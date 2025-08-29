const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

router.get('/stats', authenticateAdmin, (req, res) => {
  const results = Object.entries(global.votes).map(([id, data]) => ({
    candidateId: parseInt(id),
    candidate: data.candidate,
    votes: data.count,
    color: data.color
  }));

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  res.json({
    results,
    totalVotes,
    activeVoters: global.activeVoters.size,
    pendingOTPs: global.otpStore.size,
    serverUptime: process.uptime()
  });
});

router.post('/reset-votes', authenticateAdmin, (req, res) => {
  global.votes = {};
  global.activeVoters.clear();
  
  global.io.emit('vote-reset');
  global.io.emit('vote-update', global.votes);
  
  res.json({ message: 'All votes have been reset successfully' });
});

router.get('/export-results', authenticateAdmin, (req, res) => {
  const results = Object.entries(global.votes).map(([id, data]) => ({
    candidateId: parseInt(id),
    candidate: data.candidate,
    votes: data.count,
    percentage: global.votes ? (data.count / Object.values(global.votes).reduce((sum, v) => sum + v.count, 0) * 100).toFixed(2) : 0
  }));

  const exportData = {
    timestamp: new Date().toISOString(),
    totalVotes: Object.values(global.votes).reduce((sum, v) => sum + v.count, 0),
    results,
    exportedBy: req.user.email
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=voting-results.json');
  res.json(exportData);
});

module.exports = router;