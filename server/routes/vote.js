const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').toLowerCase().replace(/\s+/g, '-');
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
    image: "/uploads/ahmad-santoso.jpg",
    vision: "Teknologi untuk Semua",
    mission: "Membangun infrastruktur digital yang merata di seluruh Indonesia. Meningkatkan literasi digital masyarakat melalui program pelatihan gratis. Menciptakan lapangan kerja berbasis teknologi untuk generasi muda.",
    color: "#4F46E5"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    party: "Gerakan Muda Indonesia",
    image: "/uploads/siti-nurhaliza.jpg",
    vision: "Indonesia Muda, Indonesia Maju",
    mission: "Memberdayakan pemuda sebagai agen perubahan positif. Mengembangkan program kewirausahaan untuk startup lokal. Meningkatkan kualitas pendidikan dan pelatihan vokasi.",
    color: "#059669"
  },
  {
    id: 3,
    name: "Budi Prasetyo",
    party: "Koalisi Rakyat Sejahtera",
    image: "/uploads/budi-prasetyo.jpg",
    vision: "Kesejahteraan untuk Semua",
    mission: "Mengurangi kesenjangan ekonomi melalui program bantuan sosial yang tepat sasaran. Menciptakan lapangan kerja melalui pemberdayaan UMKM. Meningkatkan akses layanan kesehatan dan pendidikan berkualitas.",
    color: "#DC2626"
  },
  {
    id: 4,
    name: "Maya Sari",
    party: "Partai Lingkungan Hijau",
    image: "/uploads/maya-sari.jpg",
    vision: "Indonesia Hijau dan Berkelanjutan",
    mission: "Mengembangkan energi terbarukan untuk mengurangi emisi karbon. Melindungi hutan dan keanekaragaman hayati Indonesia. Menciptakan ekonomi hijau melalui industri ramah lingkungan.",
    color: "#16A34A"
  }
];

router.get('/candidates', (req, res) => {
  res.json(sampleCandidates);
});

router.post('/candidates/:id/photo', authenticateToken, upload.single('photo'), (req, res) => {
  try {
    const candidateId = parseInt(req.params.id);
    const candidateIndex = sampleCandidates.findIndex(c => c.id === candidateId);
    
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const oldImagePath = sampleCandidates[candidateIndex].image;
    if (oldImagePath && oldImagePath.startsWith('/uploads/')) {
      const oldFullPath = path.join(__dirname, '..', oldImagePath);
      if (fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
      }
    }

    sampleCandidates[candidateIndex].image = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Photo updated successfully',
      candidate: sampleCandidates[candidateIndex]
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

router.put('/candidates/:id', authenticateToken, (req, res) => {
  try {
    const candidateId = parseInt(req.params.id);
    const candidateIndex = sampleCandidates.findIndex(c => c.id === candidateId);
    
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, party, vision, mission, color } = req.body;
    
    if (name) sampleCandidates[candidateIndex].name = name;
    if (party) sampleCandidates[candidateIndex].party = party;
    if (vision) sampleCandidates[candidateIndex].vision = vision;
    if (mission) sampleCandidates[candidateIndex].mission = mission;
    if (color) sampleCandidates[candidateIndex].color = color;
    
    res.json({
      message: 'Candidate updated successfully',
      candidate: sampleCandidates[candidateIndex]
    });
  } catch (error) {
    console.error('Candidate update error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
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
  const results = Object.entries(global.votes).map(([id, data]) => {
    const candidate = sampleCandidates.find(c => c.id === parseInt(id));
    return {
      candidateId: parseInt(id),
      candidate: data.candidate,
      votes: data.count,
      color: data.color,
      image: candidate ? candidate.image : null
    };
  });

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