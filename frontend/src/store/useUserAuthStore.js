import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useUserAuthStore = create((set, get) => ({
  authUser: null,
  isLoading: true,
  isAdmin: false,
  isAuthReady: false,
  isRequestingReset: false,
  isResettingPassword: false,
  isChangingPassword: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/user/auth/check');

      set({
        authUser: res.data, // Assuming backend returns { user: { _id, username, email, role } }
        isAdmin: res.data.role === 'admin', // Set isAdmin based on backend response
      });
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null });
    } finally {
      set({ isLoading: false, isAuthReady: true });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post('/user/auth/signup', data);
      set({ authUser: res.data });
      toast.success('account created');
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      // console.log('User login data:', data); // Add this
      const res = await axiosInstance.post('/user/auth/login', data);
      set({ authUser: res.data });
      toast.success('Welcome Back!');
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/user/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put('/user/auth/update', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete('/user/auth/delete');
      toast.success('Account deleted');
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Sends a request to the backend to initiate the password reset process.
   * @param {string} email - The email address for which to reset the password.
   */
  forgotPassword: async (email) => {
    set({ isRequestingReset: true });
    try {
      const res = await axiosInstance.post('/user/auth/forgot-password', { email });
      toast.success(res.data.message); // Backend should return a generic success message
    } catch (error) {
      console.error('Error in forgotPassword store action:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      set({ isRequestingReset: false });
    }
  },

  /**
   * Resets the user's password using a received token.
   * @param {string} token - The password reset token from the email link.
   * @param {string} newPassword - The new password for the user.
   */
  resetPassword: async (token, newPassword) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post(`/user/auth/reset-password/${token}`, {
        newPassword,
      });
      toast.success(res.data.message);
    } catch (error) {
      console.error('Error in resetPassword store action:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to reset password. Please try again.'
      );
    } finally {
      set({ isResettingPassword: false });
    }
  },

  /**
   * Allows an authenticated user to change their password.
   * @param {string} oldPassword - The user's current password.
   * @param {string} newPassword - The new password for the user.
   */
  changePassword: async (oldPassword, newPassword) => {
    set({ isChangingPassword: true });
    try {
      const res = await axiosInstance.put('/user/auth/change-password', {
        oldPassword,
        newPassword,
      });
      toast.success(res.data.message);
    } catch (error) {
      console.error('Error in changePassword store action:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to change password. Please try again.'
      );
    } finally {
      set({ isChangingPassword: false });
    }
  },
}));