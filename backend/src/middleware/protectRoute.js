import { supabase } from '../lib/supabase.js';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - No token provided.' });
    }

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token.' });
    }

    // Fetch user from local database
    const user = await User.findByPk(supabaseUser.id);

    if (!user) {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
