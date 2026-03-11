const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
exports.authenticateToken = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach user info to request (so routes can access it!)
    req.user = decoded;  // Now routes can use req.user.user_id, req.user.role
    
    // 5. Continue to next middleware/route
    next();
    
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  // 1. Check if req.user exists (should exist from authenticateToken)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  // 2. Check if user is admin
  if (req.user.role !== 'admin') {
    // 3. If NOT admin, return 403 Forbidden
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only."
    });
  }
  
  // 4. If admin, continue to route
  next();
};