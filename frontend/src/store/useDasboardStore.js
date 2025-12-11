import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useDashboardStore = create((set, get) => ({
  dashboardStats: null,
  carStats: null,
  blogStats: null,
  userStats: null,
  moderationStats: null,
  revenueStats: null,
  recentActivity: null,
  topPerformers: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  listings: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  isFetchingListings: false,
  listingError: null,
  blogs: [],
  totalBlogItems: 0,
  totalBlogPages: 1,
  currentBlogPage: 1,
  isFetchingBlogs: false,
  blogError: null,
  staffs: [],
  totalStaffs: 0,
  totalStaffPages: 1,
  currentStaffPage: 1,
  isFetchingStaffs: false,
  staffError: null,
  users: [],
  totalUsers: 0,
  totalUserPages: 1,
  currentUserPage: 1,
  isFetchingUsers: false,
  userError: null,
  commentsStats: null,
  comments: [],
  totalComments: 0,
  totalCommentPages: 1,
  currentCommentPage: 1,
  commentFilter: 'all',
  isFetchingComments: false,
  commentError: null,
  isUpdatingComment: false,
  reviewsStats: null,
  reviews: [],
  totalReviews: 0,
  totalReviewPages: 1,
  currentReviewPage: 1,
  reviewFilter: 'all',
  isFetchingReviews: false,
  reviewError: null,
  isUpdatingReview: false,
  sellSubmissionsStats: null,
  sellSubmissions: [],
  totalSellSubmissions: 0,
  totalSellPages: 1,
  currentSellPage: 1,
  sellSubmissionFilter: 'all',
  isFetchingSellSubmissions: false,
  sellSubmissionError: null,
  isUpdatingSellSubmission: false,

  getDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/stats');

      if (res.data.success) {
        set({
          dashboardStats: res.data.data,
          lastUpdated: new Date().toISOString(),
        });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch dashboard stats';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getCarStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/cars/stats');

      if (res.data.success) {
        set({ carStats: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch car statistics';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getBlogStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/blogs/stats');

      if (res.data.success) {
        set({ blogStats: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch blog statistics';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/users/stats');

      if (res.data.success) {
        set({ userStats: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch user statistics';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getModerationStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/moderation/stats');

      if (res.data.success) {
        set({ moderationStats: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch moderation statistics';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getRevenueStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/revenue/stats');

      if (res.data.success) {
        set({ revenueStats: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch revenue statistics';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getRecentActivity: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/activity/recent', {
        params,
      });

      if (res.data.success) {
        set({ recentActivity: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch recent activity';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getTopPerformers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/performance/top');

      if (res.data.success) {
        set({ topPerformers: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch top performers';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshAllStats: async (adminRole = 'editor') => {
    set({ isLoading: true, error: null });

    try {
      // Always fetch basic stats
      const promises = [
        get().getDashboardStats(),
        get().getModerationStats(),
        get().getRecentActivity(),
      ];

      // Fetch role-specific stats
      if (adminRole === 'super_admin' || adminRole === 'editor') {
        promises.push(
          get().getCarStats(),
          get().getBlogStats(),
          get().getTopPerformers()
        );
      }

      // Super admin only stats
      if (adminRole === 'super_admin') {
        promises.push(get().getUserStats(), get().getRevenueStats());
      }

      await Promise.allSettled(promises);

      set({ lastUpdated: new Date().toISOString() });
      toast.success('Dashboard data refreshed');

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      const errorMessage = 'Failed to refresh dashboard data';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  getStatsSummary: () => {
    const { dashboardStats } = get();

    if (!dashboardStats) return null;

    return {
      totalCars: dashboardStats.cars?.total || 0,
      availableCars: dashboardStats.cars?.available || 0,
      soldCars: dashboardStats.cars?.sold || 0,
      totalBlogs: dashboardStats.blogs?.total || 0,
      publishedBlogs: dashboardStats.blogs?.published || 0,
      totalUsers: dashboardStats.users?.total || 0,
      pendingComments: dashboardStats.engagement?.pendingComments || 0,
      pendingReviews: dashboardStats.engagement?.pendingReviews || 0,
      newsletterSubscribers:
        dashboardStats.engagement?.newsletterSubscribers || 0,
      totalRevenue: dashboardStats.revenue?.totalRevenue || 'N/A',
      monthlyRevenue: dashboardStats.revenue?.monthlyRevenue || 'N/A',
    };
  },

  needsRefresh: () => {
    const { lastUpdated } = get();
    if (!lastUpdated) return true;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastUpdated) < fiveMinutesAgo;
  },


  clearStats: () => {
    set({
      dashboardStats: null,
      carStats: null,
      blogStats: null,
      userStats: null,
      moderationStats: null,
      revenueStats: null,
      recentActivity: null,
      topPerformers: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },

  getListings: async () => {
    set({ isFetchingListings: true, listingError: null });

    const { currentPage } = get();

    // You can add more filters here based on your UI state
    const params = {
      page: currentPage,
      limit: 20, // Customize as needed
      // make: get().makeFilter,
      // sold: get().soldFilter,
    };

    try {
      const res = await axiosInstance.get('admin/dashboard/getListings', { params });

      set({
        listings: res.data.listings,
        totalItems: res.data.totalItems,
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
        isFetchingListings: false,
      });

      toast.success('Car listings loaded successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch listings.';

      set({
        listings: [],
        listingError: errorMessage,
        isFetchingListings: false,
      });

      toast.error(errorMessage);
    }
  },

  getBlogs: async (params = {}) => {
    set({ isFetchingBlogs: true, blogError: null });

    try {
      const res = await axiosInstance.get('admin/dashboard/getBlogs', { params });

      set({
        blogs: res.data.data,
        totalBlogItems: res.data.totalItems,
        totalBlogPages: res.data.totalPages,
        currentBlogPage: res.data.currentPage,
        isFetchingBlogs: false,
      });

      toast.success('Blogs loaded successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch blogs.';

      set({
        blogs: [],
        blogError: errorMessage,
        isFetchingBlogs: false,
      });

      toast.error(errorMessage);
    }
  },

  getStaffs: async (page, limit = 20) => {
    set({ isFetchingStaffs: true, staffError: null });
    try {
      const params = { page, limit };
      const res = await axiosInstance.get('admin/dashboard/getStaffs', { params });

      set({
        staffs: res.data.data.staffs, // FIX: was res.staffs
        totalStaffs: res.data.data.pagination.totalStaffs,
        totalStaffPages: res.data.data.pagination.totalPages,
        currentStaffPage: res.data.data.pagination.currentPage,
        isFetchingStaffs: false,
      });

      toast.success('Staffs loaded successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch staffs.';

      set({
        staffs: [],
        staffError: errorMessage,
        isFetchingStaffs: false,
      });

      toast.error(errorMessage);
    }
  },

  getUsers: async (params = {}) => {
    set({ isFetchingUsers: true, userError: null });
    try {
      const { page = 1, limit = 10, search } = params;
      const queryParams = { page, limit };
      if (search) queryParams.search = search;

      const res = await axiosInstance.get('admin/dashboard/getUsers', {
        params: queryParams
      });

      set({
        users: res.data.data.users,
        totalUsers: res.data.data.pagination.totalUsers,
        totalUserPages: res.data.data.pagination.totalPages,
        currentUserPage: res.data.data.pagination.currentPage,
        isFetchingUsers: false,
      });

      toast.success('Users loaded successfully!');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch users.';

      set({
        users: [],
        userError: errorMessage,
        isFetchingUsers: false,
      });

      toast.error(errorMessage);
    }
  },

  getCommentsStats: async () => {
    set({ isFetchingComments: true, commentError: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/comments/stats');

      set({
        commentsStats: res.data.data,
        isFetchingComments: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch comments stats';

      set({
        commentError: errorMessage,
        isFetchingComments: false,
      });

      toast.error(errorMessage);
    }
  },

  getComments: async (params = {}) => {
    set({ isFetchingComments: true, commentError: null });
    try {
      const { page = 1, limit = 10, status = 'all' } = params;
      const res = await axiosInstance.get('admin/dashboard/comments', {
        params: { page, limit, status },
      });

      set({
        comments: res.data.data.comments,
        totalComments: res.data.data.pagination.total,
        totalCommentPages: res.data.data.pagination.totalPages,
        currentCommentPage: res.data.data.pagination.currentPage,
        commentFilter: status,
        isFetchingComments: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch comments';

      set({
        commentError: errorMessage,
        isFetchingComments: false,
      });

      toast.error(errorMessage);
    }
  },

  updateCommentStatus: async (commentId, status) => {
    set({ isUpdatingComment: true, commentError: null });
    try {
      const res = await axiosInstance.patch(`admin/dashboard/comments/${commentId}/status`, {
        status,
      });

      toast.success('Comment status updated successfully');

      // Refresh comments list
      const { currentCommentPage, commentFilter } = get();
      get().getComments({ page: currentCommentPage, limit: 10, status: commentFilter });
      get().getCommentsStats();

      set({ isUpdatingComment: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update comment status';

      set({
        commentError: errorMessage,
        isUpdatingComment: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  getReviewsStats: async () => {
    set({ isFetchingReviews: true, reviewError: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/reviews/stats');

      set({
        reviewsStats: res.data.data,
        isFetchingReviews: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch reviews stats';

      set({
        reviewError: errorMessage,
        isFetchingReviews: false,
      });

      toast.error(errorMessage);
    }
  },

  getReviews: async (params = {}) => {
    set({ isFetchingReviews: true, reviewError: null });
    try {
      const { page = 1, limit = 10, status = 'all' } = params;
      const res = await axiosInstance.get('admin/dashboard/reviews', {
        params: { page, limit, status },
      });

      set({
        reviews: res.data.data.reviews,
        totalReviews: res.data.data.pagination.total,
        totalReviewPages: res.data.data.pagination.totalPages,
        currentReviewPage: res.data.data.pagination.currentPage,
        reviewFilter: status,
        isFetchingReviews: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch reviews';

      set({
        reviewError: errorMessage,
        isFetchingReviews: false,
      });

      toast.error(errorMessage);
    }
  },

  updateReviewStatus: async (reviewId, status) => {
    set({ isUpdatingReview: true, reviewError: null });
    try {
      const res = await axiosInstance.patch(`admin/dashboard/reviews/${reviewId}/status`, {
        status,
      });

      toast.success('Review status updated successfully');

      // Refresh reviews list
      const { currentReviewPage, reviewFilter } = get();
      get().getReviews({ page: currentReviewPage, limit: 10, status: reviewFilter });
      get().getReviewsStats();

      set({ isUpdatingReview: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update review status';

      set({
        reviewError: errorMessage,
        isUpdatingReview: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  getSellSubmissionsStats: async () => {
    set({ isFetchingSellSubmissions: true, sellSubmissionError: null });
    try {
      const res = await axiosInstance.get('admin/dashboard/sell-submissions/stats');

      set({
        sellSubmissionsStats: res.data.data,
        isFetchingSellSubmissions: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch sell submissions stats';

      set({
        sellSubmissionError: errorMessage,
        isFetchingSellSubmissions: false,
      });

      toast.error(errorMessage);
    }
  },

  getSellSubmissions: async (params = {}) => {
    set({ isFetchingSellSubmissions: true, sellSubmissionError: null });
    try {
      const { page = 1, limit = 10, status = 'all' } = params;
      const res = await axiosInstance.get('admin/dashboard/sell-submissions', {
        params: { page, limit, status },
      });

      set({
        sellSubmissions: res.data.data.submissions,
        totalSellSubmissions: res.data.data.pagination.total,
        totalSellPages: res.data.data.pagination.totalPages,
        currentSellPage: res.data.data.pagination.currentPage,
        sellSubmissionFilter: status,
        isFetchingSellSubmissions: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch sell submissions';

      set({
        sellSubmissionError: errorMessage,
        isFetchingSellSubmissions: false,
      });

      toast.error(errorMessage);
    }
  },

  updateSellSubmissionStatus: async (submissionId, status) => {
    set({ isUpdatingSellSubmission: true, sellSubmissionError: null });
    try {
      const res = await axiosInstance.patch(
        `admin/dashboard/sell-submissions/${submissionId}/status`,
        { status }
      );

      toast.success('Submission status updated successfully');

      // Refresh submissions list
      const { currentSellPage, sellSubmissionFilter } = get();
      get().getSellSubmissions({
        page: currentSellPage,
        limit: 10,
        status: sellSubmissionFilter
      });
      get().getSellSubmissionsStats();

      set({ isUpdatingSellSubmission: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update submission status';

      set({
        sellSubmissionError: errorMessage,
        isUpdatingSellSubmission: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  sendOffer: async (submissionId, offerAmount) => {
    set({ isUpdatingSellSubmission: true, sellSubmissionError: null });
    try {
      const res = await axiosInstance.post(
        `admin/dashboard/sell-submissions/${submissionId}/offer`,
        { offerAmount }
      );

      toast.success('Offer sent successfully');

      // Refresh submissions list
      const { currentSellPage, sellSubmissionFilter } = get();
      get().getSellSubmissions({
        page: currentSellPage,
        limit: 10,
        status: sellSubmissionFilter
      });
      get().getSellSubmissionsStats();

      set({ isUpdatingSellSubmission: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send offer';

      set({
        sellSubmissionError: errorMessage,
        isUpdatingSellSubmission: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  deleteSellSubmission: async (submissionId) => {
    set({ isUpdatingSellSubmission: true, sellSubmissionError: null });
    try {
      const res = await axiosInstance.delete(
        `admin/dashboard/sell-submissions/${submissionId}`
      );

      toast.success('Submission deleted successfully');

      // Refresh submissions list
      const { currentSellPage, sellSubmissionFilter } = get();
      get().getSellSubmissions({
        page: currentSellPage,
        limit: 10,
        status: sellSubmissionFilter
      });
      get().getSellSubmissionsStats();

      set({ isUpdatingSellSubmission: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete submission';

      set({
        sellSubmissionError: errorMessage,
        isUpdatingSellSubmission: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  getUserWithDetails: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`admin/dashboard/users/${userId}/details`);

      if (res.data.success) {
        return res.data.data; // Should include user, comments, reviews, newsletter
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch user details';
      toast.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
