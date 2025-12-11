// store/useAdminStaffStore.js
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAdminStaffStore = create((set) => ({
    // State
    staff: null,
    staffList: [],
    isLoading: false,
    error: null,

    // Add new staff member
    addStaff: async (staffData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post('/admin/staff', staffData);

            if (res.data.success) {
                toast.success(res.data.message);
                set({ isLoading: false });

                // Navigate back to staff list
                window.history.back();
                return true;
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to add staff member';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Update staff member
    updateStaff: async (id, staffData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.put(`/admin/staff/${id}`, staffData);

            if (res.data.success) {
                toast.success(res.data.message);
                set({ isLoading: false });

                // Navigate back to staff list
                window.history.back();
                return true;
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to update staff member';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Get staff member by ID
    getStaffById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/admin/staff/${id}`);

            if (res.data.success) {
                set({ staff: res.data.data, isLoading: false });
                return res.data.data;
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch staff member';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Delete staff member
    deleteStaff: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/admin/staff/${id}`);

            if (res.data.success) {
                toast.success(res.data.message);

                // Remove the deleted staff from the local state
                set((state) => ({
                    staffList: state.staffList.filter((staff) => staff.id !== id),
                    isLoading: false,
                }));

                return true;
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to delete staff member';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Get all staff members
    getAllStaff: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get('/admin/staff', { params });

            if (res.data.success) {
                set({
                    staffList: res.data.data.staffs,
                    isLoading: false
                });
                return res.data.data;
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to fetch staff list';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear staff data
    clearStaff: () => set({ staff: null }),
}));