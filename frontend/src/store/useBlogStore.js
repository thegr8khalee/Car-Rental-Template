import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import {
  buildCacheConfig,
  buildAxiosCacheOptions,
  hasCachedResponse,
  createAxiosRequestConfig,
} from './cacheHelpers.js';

export const useBlogStore = create((set) => ({
  // State
  blogs: [],
  relatedBlogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
  },

  fetchBlogs: async (params = {}, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);
    const cacheConfig = buildCacheConfig('/blogs/get-all', params);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const response = await axiosInstance.get(
        `/blogs/get-all`,
        createAxiosRequestConfig(cacheOptions, { params })
      );
      const { data, currentPage, totalPages, totalBlogs } = response.data;
      set({
        blogs: data,
        pagination: { currentPage, totalPages, totalBlogs },
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch blogs.';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBlogById: async (id, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);
    const cacheConfig = buildCacheConfig(`/blogs/get/${id}`);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const response = await axiosInstance.get(
        `/blogs/get/${id}`,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ currentBlog: response.data.data });
    } catch (error) {
      console.error('Error fetching blog:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch blog.';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  searchBlogs: async (query, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);
    const url = `/blogs/search?query=${encodeURIComponent(query)}`;
    const cacheConfig = buildCacheConfig(url);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const response = await axiosInstance.get(
        url,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ blogs: response.data.data });
    } catch (error) {
      console.error('Error searching blogs:', error);
      const errorMessage = error.response?.data?.message || 'No blogs found.';
      set({ blogs: [] }); // Clear blogs on no results
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  getRelatedBlogsById: async (id, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);
    const cacheConfig = buildCacheConfig(`/blogs/getRelated/${id}`);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const response = await axiosInstance.get(
        `/blogs/getRelated/${id}`,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ relatedBlogs: response.data.data.relatedBlogs });
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch related blogs.';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCurrentBlog: () => {
    set({ currentBlog: null });
  },
}));
