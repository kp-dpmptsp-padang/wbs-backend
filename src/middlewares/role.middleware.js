const authorize = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }
      
      return res.status(403).json({ message: "Access forbidden" });
    };
  };
  
module.exports = authorize;