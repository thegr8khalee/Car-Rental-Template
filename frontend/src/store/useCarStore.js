import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import {
  buildCacheConfig,
  buildAxiosCacheOptions,
  hasCachedResponse,
  createAxiosRequestConfig,
} from './cacheHelpers.js';

export const useCarStore = create((set) => ({
  // State
  cars: [],
  car: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  // Actions
  /**
   * Fetches a paginated list of all cars with optional filters.
   * @param {Object} params - An object containing query parameters for filtering and pagination.
   * e.g., { page: 2, limit: 10, make: 'Toyota', year: 2023 }
   */
  getCars: async (params = {}, options = {}) => {
    const cacheConfig = buildCacheConfig('cars/get-all', params);
    const cacheOptions = buildAxiosCacheOptions(options);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const res = await axiosInstance.get(
        'cars/get-all',
        createAxiosRequestConfig(cacheOptions, { params })
      );

      // Update state with the cars and pagination data from the response
      set({
        cars: res.data.cars,
        pagination: {
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalItems: res.data.totalItems,
        },
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to retrieve cars.';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Searches for cars based on a single query string.
   * @param {string} query - The search term.
   */
  search: async (params = {}, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);

    try {
      // Convert params object to URL search params
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });

      const url = `/cars/search?${searchParams.toString()}`;
      const cacheConfig = buildCacheConfig(url);
      const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

      set({ isSearching: !hasCachedData, error: null });

      const response = await axiosInstance.get(
        url,
        createAxiosRequestConfig(cacheOptions)
      );
      const data = response.data;

      if (response.status === 200) {
        set({
          searchResults: data.data,
          cars: data.data, // Update both for compatibility
          isSearching: false,
        });
      } else {
        set({
          searchResults: [],
          cars: [],
          error: data.message,
          isSearching: false,
        });
      }
    } catch (error) {
      set({
        error: error.message,
        isSearching: false,
        searchResults: [],
        cars: [],
      });
    }
  },

  /**
   * Fetches a single car by its ID.
   * @param {string} id - The ID of the car to fetch.
   */
  getCarById: async (id, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);
    const cacheConfig = buildCacheConfig(`cars/get/${id}`);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const res = await axiosInstance.get(
        `cars/get/${id}`,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ car: res.data }); // Updated to match API response format
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to retrieve car.';
      toast.error(errorMessage);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSearchResults: () => set({ searchResults: [] }),

  invalidateCache: () => {
    axiosInstance.cache?.invalidateByUrl?.('cars/');
  },
}));
