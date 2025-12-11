import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useContentStore = create((set, get) => ({
  // State
  blogs: [],
  blog: null,
  comments: [],
  reviews: [],
  pendingComments: [],
  pendingReviews: [],
  newsletters: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  // Blog Management Actions

  /**
   * Get all blogs with filters and pagination
   * @param {Object} params - Query parameters
   */
  getBlogs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('blogs', { params });
      
      set({
        blogs: res.data.blogs || res.data.data,
        pagination: {
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalItems: res.data.totalItems,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch blogs';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get blog by ID
   * @param {string} id - Blog ID
   */
  getBlogById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`blogs/${id}`);
      set({ blog: res.data });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch blog';
      toast.error(errorMessage);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Create new blog
   * @param {Object} blogData - Blog data
   */
  createBlog: async (blogData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post('admin/blogs', blogData);
      
      if (res.data.success) {
        // Add new blog to the beginning of the list
        set(state => ({
          blogs: [res.data.blog, ...state.blogs]
        }));
        
        toast.success('Blog created successfully');
        return res.data.blog;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create blog';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update blog
   * @param {string} id - Blog ID
   * @param {Object} blogData - Updated blog data
   */
  updateBlog: async (id, blogData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(`admin/blogs/${id}`, blogData);
      
      if (res.data.success) {
        const updatedBlog = res.data.blog;
        
        // Update blog in the list
        set(state => ({
          blogs: state.blogs.map(blog => 
            blog.id === id ? updatedBlog : blog
          ),
          blog: state.blog?.id === id ? updatedBlog : state.blog
        }));
        
        toast.success('Blog updated successfully');
        return updatedBlog;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update blog';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete blog
   * @param {string} id - Blog ID
   */
  deleteBlog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`admin/blogs/${id}`);
      
      if (res.data.success) {
        // Remove blog from the list
        set(state => ({
          blogs: state.blogs.filter(blog => blog.id !== id),
          blog: state.blog?.id === id ? null : state.blog
        }));
        
        toast.success('Blog deleted successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete blog';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Publish/Unpublish blog
   * @param {string} id - Blog ID
   * @param {string} status - New status ('published', 'draft', 'archived')
   */
  updateBlogStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`admin/blogs/${id}/status`, { status });
      
      if (res.data.success) {
        const updatedBlog = res.data.blog;
        
        set(state => ({
          blogs: state.blogs.map(blog => 
            blog.id === id ? { ...blog, status } : blog
          ),
          blog: state.blog?.id === id ? { ...state.blog, status } : state.blog
        }));
        
        toast.success(`Blog ${status} successfully`);
        return updatedBlog;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${status} blog`;
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Comment Moderation Actions

  /**
   * Get all comments with filters
   * @param {Object} params - Query parameters
   */
  getComments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/comments', { params });
      
      set({
        comments: res.data.comments || res.data.data,
        pagination: {
          currentPage: res.data.currentPage || 1,
          totalPages: res.data.totalPages || 1,
          totalItems: res.data.totalItems || 0,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch comments';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get pending comments for moderation
   */
  getPendingComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/comments', { 
        params: { status: 'pending' } 
      });
      
      set({ pendingComments: res.data.comments || res.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending comments';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Moderate comment (approve, reject, mark as spam)
   * @param {string} id - Comment ID
   * @param {string} action - Action to take ('approve', 'reject', 'spam')
   */
  moderateComment: async (id, action) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`admin/comments/${id}/moderate`, { action });
      
      if (res.data.success) {
        // Update comment status in all relevant arrays
        const updateCommentStatus = (comment) => 
          comment.id === id ? { ...comment, status: action === 'approve' ? 'approved' : action } : comment;
        
        set(state => ({
          comments: state.comments.map(updateCommentStatus),
          pendingComments: state.pendingComments.filter(comment => comment.id !== id)
        }));
        
        toast.success(`Comment ${action}d successfully`);
        return res.data.comment;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} comment`;
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete comment
   * @param {string} id - Comment ID
   */
  deleteComment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`admin/comments/${id}`);
      
      if (res.data.success) {
        set(state => ({
          comments: state.comments.filter(comment => comment.id !== id),
          pendingComments: state.pendingComments.filter(comment => comment.id !== id)
        }));
        
        toast.success('Comment deleted successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete comment';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Review Moderation Actions

  /**
   * Get all reviews with filters
   * @param {Object} params - Query parameters
   */
  getReviews: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/reviews', { params });
      
      set({
        reviews: res.data.reviews || res.data.data,
        pagination: {
          currentPage: res.data.currentPage || 1,
          totalPages: res.data.totalPages || 1,
          totalItems: res.data.totalItems || 0,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch reviews';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get pending reviews for moderation
   */
  getPendingReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/reviews', { 
        params: { status: 'pending' } 
      });
      
      set({ pendingReviews: res.data.reviews || res.data.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending reviews';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Moderate review (approve, reject, mark as spam)
   * @param {string} id - Review ID
   * @param {string} action - Action to take ('approve', 'reject', 'spam')
   */
  moderateReview: async (id, action) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`admin/reviews/${id}/moderate`, { action });
      
      if (res.data.success) {
        // Update review status in all relevant arrays
        const updateReviewStatus = (review) => 
          review.id === id ? { ...review, status: action === 'approve' ? 'approved' : action } : review;
        
        set(state => ({
          reviews: state.reviews.map(updateReviewStatus),
          pendingReviews: state.pendingReviews.filter(review => review.id !== id)
        }));
        
        toast.success(`Review ${action}d successfully`);
        return res.data.review;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} review`;
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete review
   * @param {string} id - Review ID
   */
  deleteReview: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`admin/reviews/${id}`);
      
      if (res.data.success) {
        set(state => ({
          reviews: state.reviews.filter(review => review.id !== id),
          pendingReviews: state.pendingReviews.filter(review => review.id !== id)
        }));
        
        toast.success('Review deleted successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete review';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Newsletter Management Actions

  /**
   * Get all newsletter subscribers
   * @param {Object} params - Query parameters
   */
  getNewsletterSubscribers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/newsletter', { params });
      
      set({
        newsletters: res.data.subscribers || res.data.data,
        pagination: {
          currentPage: res.data.currentPage || 1,
          totalPages: res.data.totalPages || 1,
          totalItems: res.data.totalItems || 0,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch newsletter subscribers';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Export newsletter subscribers
   * @param {Object} filters - Export filters
   */
  exportNewsletterSubscribers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('admin/newsletter/export', { 
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Newsletter subscribers exported successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to export newsletter subscribers';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Remove newsletter subscriber
   * @param {string} id - Subscriber ID
   */
  removeNewsletterSubscriber: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`admin/newsletter/${id}`);
      
      if (res.data.success) {
        set(state => ({
          newsletters: state.newsletters.filter(subscriber => subscriber.id !== id)
        }));
        
        toast.success('Subscriber removed successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove subscriber';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Bulk Actions

  /**
   * Bulk moderate comments
   * @param {Array} commentIds - Array of comment IDs
   * @param {string} action - Action to take ('approve', 'reject', 'spam', 'delete')
   */
  bulkModerateComments: async (commentIds, action) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch('admin/comments/bulk', {
        commentIds,
        action
      });
      
      if (res.data.success) {
        if (action === 'delete') {
          // Remove deleted comments
          set(state => ({
            comments: state.comments.filter(comment => !commentIds.includes(comment.id)),
            pendingComments: state.pendingComments.filter(comment => !commentIds.includes(comment.id))
          }));
        } else {
          // Update comment statuses
          const newStatus = action === 'approve' ? 'approved' : action;
          set(state => ({
            comments: state.comments.map(comment => 
              commentIds.includes(comment.id) ? { ...comment, status: newStatus } : comment
            ),
            pendingComments: state.pendingComments.filter(comment => !commentIds.includes(comment.id))
          }));
        }
        
        toast.success(`${commentIds.length} comments ${action}d successfully`);
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} comments`;
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Bulk moderate reviews
   * @param {Array} reviewIds - Array of review IDs
   * @param {string} action - Action to take ('approve', 'reject', 'spam', 'delete')
   */
  bulkModerateReviews: async (reviewIds, action) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch('admin/reviews/bulk', {
        reviewIds,
        action
      });
      
      if (res.data.success) {
        if (action === 'delete') {
          // Remove deleted reviews
          set(state => ({
            reviews: state.reviews.filter(review => !reviewIds.includes(review.id)),
            pendingReviews: state.pendingReviews.filter(review => !reviewIds.includes(review.id))
          }));
        } else {
          // Update review statuses
          const newStatus = action === 'approve' ? 'approved' : action;
          set(state => ({
            reviews: state.reviews.map(review => 
              reviewIds.includes(review.id) ? { ...review, status: newStatus } : review
            ),
            pendingReviews: state.pendingReviews.filter(review => !reviewIds.includes(review.id))
          }));
        }
        
        toast.success(`${reviewIds.length} reviews ${action}d successfully`);
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} reviews`;
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Utility Actions

  /**
   * Get content statistics summary
   */
  getContentSummary: () => {
    const { blogs, comments, reviews, pendingComments, pendingReviews } = get();
    
    return {
      totalBlogs: blogs.length,
      publishedBlogs: blogs.filter(blog => blog.status === 'published').length,
      draftBlogs: blogs.filter(blog => blog.status === 'draft').length,
      totalComments: comments.length,
      pendingCommentsCount: pendingComments.length,
      approvedComments: comments.filter(comment => comment.status === 'approved').length,
      totalReviews: reviews.length,
      pendingReviewsCount: pendingReviews.length,
      approvedReviews: reviews.filter(review => review.status === 'approved').length,
    };
  },

  /**
   * Clear all content data
   */
  clearContentData: () => {
    set({
      blogs: [],
      blog: null,
      comments: [],
      reviews: [],
      pendingComments: [],
      pendingReviews: [],
      newsletters: [],
      isLoading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      },
    });
  },

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));