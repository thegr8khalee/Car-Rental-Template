/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAdminStore = create((set, get) => ({
  // State
  admin: null,
  admins: [],
  isLoading: false,
  isAuthenticated: false,
  error: null,
  token: localStorage.getItem('adminToken') || null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  // Actions

  /**
   * Admin signup (Super Admin only)
   * @param {Object} adminData - Admin registration data
   */
  signup: async (adminData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post('admin/signup', adminData);
      
      if (res.data.success) {
        toast.success(res.data.message || 'Admin account created successfully');
        return res.data.admin;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create admin account';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Admin login
   * @param {Object} credentials - Email and password
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post('admin/login', credentials);
      
      if (res.data.success) {
        const { token, admin } = res.data;
        
        // Store token in localStorage and axios defaults
        localStorage.setItem('adminToken', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({ 
          admin, 
          token, 
          isAuthenticated: true,
          error: null 
        });
        
        toast.success('Login successful');
        return admin;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Admin logout
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosInstance.post('admin/logout');
      
      // Clear token from localStorage and axios defaults
      localStorage.removeItem('adminToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      set({ 
        admin: null, 
        token: null, 
        isAuthenticated: false,
        admins: [],
        error: null 
      });
      
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      localStorage.removeItem('adminToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      set({ 
        admin: null, 
        token: null, 
        isAuthenticated: false,
        admins: [],
        error: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Check authentication status
   */
  checkAuth: async () => {
    const { token } = get();
    if (!token) return false;

    set({ isLoading: true });
    try {
      // Set token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await axiosInstance.get('admin/check');
      
      if (res.data.success) {
        set({ 
          admin: res.data.admin, 
          isAuthenticated: true,
          error: null 
        });
        return true;
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('adminToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      set({ 
        admin: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get all admins (Super Admin only)
   * @param {Object} params - Query parameters for pagination and sorting
   */
  getAllAdmins: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin', { params });
      
      if (res.data.success) {
        set({
          admins: res.data.data.admins,
          pagination: {
            currentPage: res.data.data.pagination.currentPage,
            totalPages: res.data.data.pagination.totalPages,
            totalItems: res.data.data.pagination.totalItems,
          },
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch admin accounts';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get admin by ID
   * @param {string} id - Admin ID
   */
  getAdminById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`admin/${id}`);
      
      if (res.data.success) {
        return res.data.data.admin;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch admin account';
      toast.error(errorMessage);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update admin profile
   * @param {string} id - Admin ID
   * @param {Object} updateData - Data to update
   */
  updateAdmin: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`admin/${id}`, updateData);
      
      if (res.data.success) {
        const updatedAdmin = res.data.admin;
        
        // Update admin in admins list
        set(state => ({
          admins: state.admins.map(admin => 
            admin.id === id ? updatedAdmin : admin
          ),
          // Update current admin if updating own profile
          admin: state.admin?.id === id ? updatedAdmin : state.admin
        }));
        
        toast.success('Admin account updated successfully');
        return updatedAdmin;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update admin account';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Change admin password
   * @param {string} id - Admin ID
   * @param {Object} passwordData - Current and new passwords
   */
  changePassword: async (id, passwordData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`admin/${id}/password`, passwordData);
      
      if (res.data.success) {
        toast.success('Password changed successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete admin account (Super Admin only)
   * @param {string} id - Admin ID to delete
   */
  deleteAdmin: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`admin/${id}`);
      
      if (res.data.success) {
        // Remove admin from admins list
        set(state => ({
          admins: state.admins.filter(admin => admin.id !== id)
        }));
        
        toast.success('Admin account deleted successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete admin account';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Initialize admin store on app start
   */
  initialize: async () => {
    const { token } = get();
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await get().checkAuth();
    }
  },

  /**
   * Clear all admin state
   */
  clearState: () => {
    set({
      admin: null,
      admins: [],
      isLoading: false,
      isAuthenticated: false,
      error: null,
      token: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      },
    });
  },
}));