// middleware/adminAuthMiddleware.js
import { supabase } from '../lib/supabase.js';
import Admin from '../models/admin.model.js';

export const protectAdminRoute = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authorized, no token provided.' });
    }

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({
        message: 'Not authorized, invalid token.',
      });
    }

    // Find the admin user by ID from the decoded token.
    // Use Sequelize's findByPk and the 'attributes' option to exclude sensitive data.
    const admin = await Admin.findByPk(supabaseUser.id);

    if (!admin) {
      // If the user is authenticated but not found in the Admin table, they are not an admin.
      return res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }

    // Attach the admin object to the request for subsequent middleware/controllers
    req.admin = admin;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in protectAdminRoute middleware: ', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authorized. Please log in.' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}.` 
      });
    }

    next();
  };
};
