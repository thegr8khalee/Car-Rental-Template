// controllers/adminStaff.controller.js
import Admin from '../models/admin.model.js';
import { supabase } from '../lib/supabase.js';
import cloudinary from '../lib/cloudinary.js';
import { Op } from 'sequelize';

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (base64Image) => {
  if (!base64Image) return null;
  
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'car-dealership/staff-avatars',
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folderIndex = parts.indexOf('car-dealership');
  if (folderIndex !== -1) {
    const pathAfterFolder = parts.slice(folderIndex).join('/');
    return pathAfterFolder.replace(/\.[^/.]+$/, ''); // Remove extension
  }
  return filename.split('.')[0];
};

// Add new staff member
export const addStaff = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      position,
      role,
      bio,
      avatar,
    } = req.body;

    // Validation
    if (!username || !email || !password || !position) {
      return res.status(400).json({
        message: 'Missing required fields: username, email, password, position',
      });
    }

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'Username or email already exists',
      });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: role || 'editor',
          position,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: 'Failed to create staff account in Supabase' });
    }

    // Upload avatar if provided
    let avatarUrl = null;
    if (avatar && avatar.startsWith('data:image')) {
      const uploadedAvatar = await uploadImageToCloudinary(avatar);
      avatarUrl = uploadedAvatar.url;
    }

    // Create new admin in local DB using Supabase ID
    const newAdmin = await Admin.create({
      id: authData.user.id,
      username,
      email,
      position,
      role: role || 'editor',
      bio: bio || null,
      avatar: avatarUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: newAdmin,
    });
  } catch (error) {
    console.error('Error in addStaff controller:', error);
    const errorMessage =
      error.name === 'SequelizeValidationError'
        ? error.errors.map((e) => e.message).join(', ')
        : error.message;
    res.status(500).json({ message: errorMessage });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      position,
      role,
      bio,
      avatar,
    } = req.body;

    // Find the admin
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      position,
      role,
      bio,
    };

    // Update password if provided
    if (password) {
      // Note: Updating another user's password requires Supabase Service Role Key
      // or the user must do it themselves via password reset.
      // For now, we'll skip this or you can implement it if you have the service role key.
      console.warn('Password update for staff is not supported via this endpoint without Service Role Key.');
    }

    // Handle avatar update
    if (avatar) {
      if (avatar.startsWith('data:image')) {
        // New avatar uploaded - delete old one if exists
        if (admin.avatar) {
          const oldPublicId = extractPublicIdFromUrl(admin.avatar);
          if (oldPublicId) {
            try {
              await cloudinary.uploader.destroy(oldPublicId);
            } catch (error) {
              console.error('Error deleting old avatar:', error);
            }
          }
        }
        
        // Upload new avatar
        const uploadedAvatar = await uploadImageToCloudinary(avatar);
        updateData.avatar = uploadedAvatar.url;
      } else {
        // Existing avatar URL - keep it
        updateData.avatar = avatar;
      }
    } else {
      // No avatar provided - delete existing if any
      if (admin.avatar) {
        const oldPublicId = extractPublicIdFromUrl(admin.avatar);
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (error) {
            console.error('Error deleting avatar:', error);
          }
        }
      }
      updateData.avatar = null;
    }

    // Update the admin
    await admin.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: admin,
    });
  } catch (error) {
    console.error('Error in updateStaff controller:', error);
    const errorMessage =
      error.name === 'SequelizeValidationError'
        ? error.errors.map((e) => e.message).join(', ')
        : error.message;

    res.status(500).json({ message: errorMessage });
  }
};

// Get staff member by ID
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Error in getStaffById controller:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Note: Deleting user from Supabase Auth requires Service Role Key.
    // Since we only have Anon Key, we can only delete from local DB.
    // The Supabase user will remain but won't have access to the app data.
    // Ideally, use a server-side function with Service Role Key to delete from Supabase.
    console.warn('Deleting staff from local DB only. Supabase user remains.');

    // Delete avatar from Cloudinary if exists
    if (admin.avatar) {
      const publicId = extractPublicIdFromUrl(admin.avatar);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting avatar from Cloudinary:', error);
        }
      }
    }

    // Delete the admin
    await admin.destroy();

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteStaff controller:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all staff members (already exists in dashboard)
export const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: staffs } = await Admin.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        staffs,
        pagination: {
          totalStaffs: count,
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error in getAllStaff controller:', error);
    res.status(500).json({ message: error.message });
  }
};