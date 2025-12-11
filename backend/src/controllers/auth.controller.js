// controllers/auth.controller.js
import User from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import { supabase } from '../lib/supabase.js';
import { Op } from 'sequelize';

export const signup = async (req, res) => {
  const { fullName, email, password, phoneNumber } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: 'Signup failed' });
    }

    // 2. Create user in local PostgreSQL database
    // We use the ID from Supabase Auth as our primary key
    const newUser = await User.create({
      id: authData.user.id,
      username: fullName,
      email,
      phoneNumber,
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    console.error('Error in signup controller: ', error.message);
    // If local DB creation fails, we might want to delete the Supabase user to keep consistency
    // await supabase.auth.admin.deleteUser(authData.user.id);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // 2. Fetch user details from local DB
    const user = await User.findByPk(data.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    // Set the access token in a cookie (or return it in the body)
    res.cookie('jwt', data.session.access_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
    });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error in login Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signout error:', error);
    }

    res.cookie('jwt', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: 'Logged Out successfully' });
  } catch (error) {
    console.error('Error in logout controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authenticated: No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res
        .status(401)
        .json({ message: 'Not authenticated: Invalid or expired token.' });
    }

    let authenticatedEntity = null;
    let role = decoded.role;

    if (role === 'admin') {
      // Sequelize equivalent of Mongoose's findById with projection
      authenticatedEntity = await Admin.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] },
      });
    } else if (role === 'user') {
      authenticatedEntity = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] },
      });
    } else {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res
        .status(401)
        .json({ message: 'Not authenticated: Invalid role in token.' });
    }

    if (!authenticatedEntity) {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });
      return res.status(401).json({
        message: 'Not authenticated: User/Admin account not found in database.',
      });
    }

    // Respond with authenticated entity's data
    return res.status(200).json({
      id: authenticatedEntity.id,
      username: authenticatedEntity.username,
      email: authenticatedEntity.email,
      role: role,
      ...(role === 'user' && {
        phoneNumber: authenticatedEntity.phoneNumber,
      }),
      avatarUrl: authenticatedEntity.avatar,
      createdAt: authenticatedEntity.createdAt,
      updatedAt: authenticatedEntity.updatedAt,
    });
  } catch (error) {
    console.error('Error in checkAuth controller:', error);
    if (res.headersSent) {
      console.warn(
        'Headers already sent, cannot send error response from checkAuth catch block.'
      );
      return;
    }
    return res
      .status(500)
      .json({ message: 'Internal Server Error during authentication check.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'Not authenticated: User information missing.' });
    }

    const { username, email, phoneNumber } = req.body;
    const userId = req.user.id;

    // Use Sequelize's findByPk (find by primary key)
    const authenticatedEntity = await User.findByPk(userId);

    if (!authenticatedEntity) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (email !== undefined) {
      // Check for email uniqueness, excluding the current user's email
      if (email !== authenticatedEntity.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists && emailExists.id !== userId) {
          return res
            .status(400)
            .json({ message: 'Email already in use by another user.' });
        }
      }
      authenticatedEntity.email = email;
    }

    // Update other fields if they are provided
    if (username !== undefined) {
      authenticatedEntity.username = username;
    }
    if (phoneNumber !== undefined) {
      authenticatedEntity.phoneNumber = phoneNumber;
    }

    // Save the updated entity. Sequelize's .save() will update the existing instance.
    await authenticatedEntity.save();

    const responseData = {
      id: authenticatedEntity.id,
      username: authenticatedEntity.username,
      email: authenticatedEntity.email,
      phoneNumber: authenticatedEntity.phoneNumber,
      createdAt: authenticatedEntity.createdAt,
      updatedAt: authenticatedEntity.updatedAt,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    if (res.headersSent) {
      console.warn(
        'Headers already sent, cannot send error response from updateProfile catch block.'
      );
      return;
    }
    res
      .status(500)
      .json({ message: 'Internal Server Error during profile update.' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'Not authenticated: User information missing.' });
    }

    const userId = req.user.id;
    
    // Find the user first to ensure they exist and to get a meaningful response
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Account not found or already deleted.' });
    }

    // Use Sequelize's destroy method to delete the record
    await user.destroy();

    res.clearCookie('jwt', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.status(200).json({ message: `Your account has been deleted successfully.` });
  } catch (error) {
    console.error('Error in deleteAccount controller:', error.message);
    if (res.headersSent) {
      console.warn(
        'Headers already sent, cannot send error response from deleteAccount catch block.'
      );
      return;
    }
    res
      .status(500)
      .json({ message: 'Internal Server Error during account deletion.' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: 'Please provide an email address.' });
  }

  try {
    // Use Sequelize's findOne with a where clause
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetTokenExpiry = Date.now() + 3600000;

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request for Your Account',
      html: `
        <p>Hello ${user.username || user.email},</p>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p><code>${resetUrl}</code></p>
        <p>This link is valid for 1 hour. After that, you will need to request a new one.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thank you,</p>
        <p>Meenable Pyramids Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset email:', error);
      } else {
        console.log('Password reset email sent: %s', info.messageId);
      }
    });

    res.status(200).json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Error in forgotPassword controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'Please provide a new password.' });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Use Op.gt for the "$gt" (greater than) operator
    const user = await User.findOne({
      where: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = null; // Set to null instead of undefined
    user.passwordResetExpires = null; // Set to null instead of undefined
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error in resetPassword controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Please provide both old and new passwords.' });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'New password must be at least 6 characters long.' });
  }

  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ message: 'Not authenticated: User information missing.' });
  }

  try {
    // Use findByPk to find the user by their primary key
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error in changePassword controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
