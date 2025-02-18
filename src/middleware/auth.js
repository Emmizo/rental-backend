const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  };
  
  const isHost = (req, res, next) => {
    if (req.user.role === 'host') {
      return next();
    }
    res.status(403).json({ error: 'Forbidden - Host access required' });
  };
  
  module.exports = {
    isAuthenticated,
    isHost
  };