const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    req.user = user;
    next();
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInput = (req, res, next) => {
  const { email, name } = req.body;

  if (email && !validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }

  if (name && (name.length < 2 || name.length > 100)) {
    return res.status(400).json({
      error: 'Name must be between 2 and 100 characters',
      code: 'INVALID_NAME_LENGTH'
    });
  }

  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi
  ];

  const checkXSS = (input) => {
    if (typeof input !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(input));
  };

  if ((email && checkXSS(email)) || (name && checkXSS(name))) {
    return res.status(400).json({
      error: 'Invalid characters detected',
      code: 'SUSPICIOUS_INPUT'
    });
  }

  next();
};

const preventDuplicateVoting = (req, res, next) => {
  const { email } = req.user;

  if (global.activeVoters.has(email)) {
    return res.status(400).json({ 
      error: 'You have already voted',
      code: 'ALREADY_VOTED'
    });
  }

  next();
};

const logSecurityEvents = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const statusCode = res.statusCode;
    
    if (statusCode === 401 || statusCode === 403) {
      console.log(`Security Event: ${statusCode} - ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  validateInput,
  preventDuplicateVoting,
  logSecurityEvents
};