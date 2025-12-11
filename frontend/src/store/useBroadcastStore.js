import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useUserAuthStore } from './useUserAuthStore.js';
// Import the broadcast model structure from the previous response for clarity (optional)
// import { Broadcast, BroadcastPagination } from './useBroadcastStore.js'; 

export const useBroadcastStore = create((set, get) => ({
    broadcasts: [],
    isLoading: false,
    isSending: false,
    error: null,
    broadcastStats: null, // Holds data from getBroadcastStats
    recentBroadcasts: [], // Typically part of broadcastStats, but kept separate for clear state keys
    totalBroadcasts: 0,
    totalBroadcastPages: 1,
    currentBroadcastPage: 1,
    selectedBroadcast: null,

    getBroadcasts: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/admin/broadcast?page=${page}&limit=${limit}`);

            const { broadcasts, pagination } = response.data.data;

            set({
                broadcasts: broadcasts,
                totalBroadcasts: pagination.total,
                totalBroadcastPages: pagination.totalPages,
                currentBroadcastPage: pagination.currentPage,
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load broadcasts.';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
        }
    },

    getBroadcastById: async (id) => {
        set({ isLoading: true, error: null, selectedBroadcast: null });
        try {
            const response = await axiosInstance.get(`/admin/broadcast/${id}`);

            set({
                selectedBroadcast: response.data.data,
                isLoading: false
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load broadcast details.';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false, selectedBroadcast: null });
        }
    },

    getBroadcastStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('admin/broadcast/stats');

            set({
                broadcastStats: response.data.data,
                recentBroadcasts: response.data.data.recentBroadcasts, // Assuming the backend structure
                isLoading: false,
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load broadcast statistics.';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false, broadcastStats: null });
        }
    },

    sendBroadcast: async (data) => {
        set({ isSending: true, error: null });

        const adminId = useUserAuthStore.getState().authUser?.id;
        if (!adminId) {
            const errorMessage = 'Authentication error: Admin ID not found. Please log in again.';
            toast.error(errorMessage);
            set({ isSending: false, error: errorMessage });
            return false;
        }

        try {
            const payload = { ...data, sentById: adminId };
            const response = await axiosInstance.post('/admin/broadcast/send', payload);

            toast.success(response.data.message);

            // Refresh list and stats after sending
            get().getBroadcasts();
            get().getBroadcastStats();

            set({ isSending: false });
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Broadcast failed to send.';
            toast.error(errorMessage);
            set({ isSending: false, error: errorMessage });
            return false;
        }
    },

    deleteBroadcast: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.delete(`/admin/broadcast/${id}`);

            toast.success(response.data.message);

            // Remove the deleted broadcast from the local state array
            set((state) => ({
                broadcasts: state.broadcasts.filter(b => b.id !== id),
                isLoading: false,
            }));

            // Also refresh stats/lists that might be affected
            get().getBroadcasts(get().currentBroadcastPage);
            get().getBroadcastStats();

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete broadcast.';
            toast.error(errorMessage);
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },
}));