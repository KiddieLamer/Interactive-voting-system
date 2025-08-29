const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const sampleCandidates = [
  {
    id: 1,
    name: "Ahmad Santoso",
    party: "Partai Demokrat Digital",
    image: "https://via.placeholder.com/150/4F46E5/FFFFFF?text=AS",
    vision: "Teknologi untuk Semua",
    color: "#4F46E5"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    party: "Gerakan Muda Indonesia",
    image: "https://via.placeholder.com/150/059669/FFFFFF?text=SN",
    vision: "Indonesia Muda, Indonesia Maju",
    color: "#059669"
  },
  {
    id: 3,
    name: "Budi Prasetyo",
    party: "Koalisi Rakyat Sejahtera",
    image: "https://via.placeholder.com/150/DC2626/FFFFFF?text=BP",
    vision: "Kesejahteraan untuk Semua",
    color: "#DC2626"
  },
  {
    id: 4,
    name: "Maya Sari",
    party: "Partai Lingkungan Hijau",
    image: "https://via.placeholder.com/150/16A34A/FFFFFF?text=MS",
    vision: "Indonesia Hijau dan Berkelanjutan",
    color: "#16A34A"
  }
];

router.get('/candidates', (req, res) => {
  res.json(sampleCandidates);
});

router.post('/cast', authenticateToken, (req, res) => {
  try {
    const { candidateId } = req.body;
    const { email, name } = req.user;

    if (global.activeVoters.has(email)) {
      return res.status(400).json({ error: 'You have already voted!' });
    }

    const candidate = sampleCandidates.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(400).json({ error: 'Invalid candidate' });
    }

    if (!global.votes[candidateId]) {
      global.votes[candidateId] = {
        candidate: candidate.name,
        count: 0,
        color: candidate.color
      };
    }

    global.votes[candidateId].count++;
    global.activeVoters.add(email);

    global.io.emit('vote-update', global.votes);
    global.io.emit('new-vote', {
      candidate: candidate.name,
      voterName: name,
      timestamp: new Date().toISOString(),
      totalVotes: Object.values(global.votes).reduce((sum, v) => sum + v.count, 0)
    });

    res.json({ 
      message: 'Vote cast successfully!',
      candidate: candidate.name,
      totalVotes: Object.values(global.votes).reduce((sum, v) => sum + v.count, 0)
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/results', (req, res) => {
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
    activeVoters: global.activeVoters.size
  });
});

router.get('/status', authenticateToken, (req, res) => {
  const { email } = req.user;
  res.json({
    hasVoted: global.activeVoters.has(email),
    totalVotes: Object.values(global.votes).reduce((sum, v) => sum + v.count, 0)
  });
});

module.exports = router;