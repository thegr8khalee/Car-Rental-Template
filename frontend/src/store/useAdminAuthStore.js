import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useUserAuthStore } from './useUserAuthStore.js';
// import { useAuthStore } from './useUserAuthStore.js';

export const useAdminAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,
  isSidebarOpen: false, // Initial state: sidebar is closed


  // Action to toggle sidebar visibility
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Action to explicitly close the sidebar
  closeSidebar: () => set({ isSidebarOpen: false }),

  // Action to explicitly open the sidebar
  openSidebar: () => set({ isSidebarOpen: true }),

  adminLogin: async (data) => {
    set({ isLoading: true });
    console.log('Admin login data:', data); // Add this
    try {
      console.log('Sending login request with data:', data); // Add this
      const res = await axiosInstance.post('/admin/auth/login', data);
      console.log('Login response:', res);
      useUserAuthStore.setState({
        authUser: res.data,
        isAdmin: ['super_admin', 'editor', 'moderator'].includes(res.data?.role),
      });
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error); // Add this
      console.error('Error response:', error.response); // Add this
      toast.error(error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  adminLogout: async () => {
    try {
      await axiosInstance.post('/admin/auth/logout');
      useUserAuthStore.setState({ authUser: null });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  },
}));