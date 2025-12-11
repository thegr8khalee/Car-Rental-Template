// Utility functions for dashboard calculations and formatting

/**
 * Calculate date ranges for current and previous periods
 */
export const calculateDateRanges = () => {
  const now = new Date();
  
  // This month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  // This year
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const thisYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  
  // Last year
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  
  return {
    thisMonth: { start: thisMonthStart, end: thisMonthEnd },
    lastMonth: { start: lastMonthStart, end: lastMonthEnd },
    thisYear: { start: thisYearStart, end: thisYearEnd },
    lastYear: { start: lastYearStart, end: lastYearEnd }
  };
};

/**
 * Format currency values
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous period value
 * @param {number} newValue - Current period value
 * @returns {object} Change object with value and percentage
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (!oldValue || oldValue === 0) {
    return {
      value: newValue,
      percentage: newValue > 0 ? 100 : 0,
      direction: newValue > 0 ? 'up' : 'neutral'
    };
  }
  
  const change = newValue - oldValue;
  const percentage = Math.round((change / oldValue) * 100);
  
  return {
    value: change,
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
  };
};

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Calculate average rating from review data
 * @param {Array} reviews - Array of review objects
 * @returns {object} Average ratings object
 */
export const calculateAverageRatings = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      interior: 0,
      exterior: 0,
      comfort: 0,
      performance: 0,
      overall: 0
    };
  }
  
  const totals = reviews.reduce((acc, review) => {
    acc.interior += review.interiorRating || 0;
    acc.exterior += review.exteriorRating || 0;
    acc.comfort += review.comfortRating || 0;
    acc.performance += review.performanceRating || 0;
    return acc;
  }, { interior: 0, exterior: 0, comfort: 0, performance: 0 });
  
  const count = reviews.length;
  const avgInterior = totals.interior / count;
  const avgExterior = totals.exterior / count;
  const avgComfort = totals.comfort / count;
  const avgPerformance = totals.performance / count;
  const avgOverall = (avgInterior + avgExterior + avgComfort + avgPerformance) / 4;
  
  return {
    interior: parseFloat(avgInterior.toFixed(2)),
    exterior: parseFloat(avgExterior.toFixed(2)),
    comfort: parseFloat(avgComfort.toFixed(2)),
    performance: parseFloat(avgPerformance.toFixed(2)),
    overall: parseFloat(avgOverall.toFixed(2))
  };
};

/**
 * Get top N items from an array based on a specific field
 * @param {Array} items - Array of items
 * @param {string} field - Field to sort by
 * @param {number} limit - Number of top items to return
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Top items array
 */
export const getTopItems = (items, field, limit = 10, order = 'desc') => {
  if (!items || !Array.isArray(items)) return [];
  
  const sorted = items.sort((a, b) => {
    const aValue = a[field] || 0;
    const bValue = b[field] || 0;
    
    if (order === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });
  
  return sorted.slice(0, limit);
};

/**
 * Generate date labels for charts (last N days/months)
 * @param {number} count - Number of periods
 * @param {string} period - Period type ('days', 'months', 'years')
 * @returns {Array} Array of date labels
 */
export const generateDateLabels = (count, period = 'days') => {
  const labels = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    let date;
    
    switch (period) {
      case 'months':
        date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        break;
      case 'years':
        date = new Date(now.getFullYear() - i, 0, 1);
        labels.push(date.getFullYear().toString());
        break;
      default: // days
        date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }
  
  return labels;
};

/**
 * Calculate inventory turnover rate
 * @param {number} soldCars - Number of cars sold
 * @param {number} totalCars - Total cars in inventory
 * @param {number} days - Period in days (default: 30)
 * @returns {number} Turnover rate percentage
 */
export const calculateInventoryTurnover = (soldCars, totalCars, days = 30) => {
  if (!totalCars || totalCars === 0) return 0;
  
  // Annualized turnover rate
  const dailyTurnover = soldCars / days;
  const annualTurnover = dailyTurnover * 365;
  const turnoverRate = (annualTurnover / totalCars) * 100;
  
  return parseFloat(turnoverRate.toFixed(2));
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Calculate time ago string
 * @param {Date|string} date - Date to compare
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Validate admin permissions for specific actions
 * @param {string} adminRole - Current admin role
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} Whether admin has permission
 */
export const hasPermission = (adminRole, requiredPermission) => {
  const permissions = {
    super_admin: [
      'view_all_stats',
      'manage_users',
      'manage_admins',
      'manage_cars',
      'manage_blogs',
      'moderate_content',
      'view_revenue',
      'system_settings'
    ],
    editor: [
      'view_basic_stats',
      'manage_cars',
      'manage_blogs',
      'moderate_content'
    ],
    moderator: [
      'view_basic_stats',
      'moderate_content',
      'edit_car_descriptions'
    ]
  };
  
  return permissions[adminRole]?.includes(requiredPermission) || false;
};

/**
 * Sanitize and validate query parameters
 * @param {object} query - Request query object
 * @returns {object} Sanitized query parameters
 */
export const sanitizeQueryParams = (query) => {
  const sanitized = {};
  
  // Pagination
  sanitized.page = Math.max(1, parseInt(query.page) || 1);
  sanitized.limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  
  // Date filters
  if (query.startDate) {
    const startDate = new Date(query.startDate);
    if (!isNaN(startDate.getTime())) {
      sanitized.startDate = startDate;
    }
  }
  
  if (query.endDate) {
    const endDate = new Date(query.endDate);
    if (!isNaN(endDate.getTime())) {
      sanitized.endDate = endDate;
    }
  }
  
  // Status filters
  const validStatuses = ['pending', 'approved', 'rejected', 'spam', 'draft', 'published', 'archived'];
  if (query.status && validStatuses.includes(query.status)) {
    sanitized.status = query.status;
  }
  
  // Sort parameters
  const validSortFields = ['createdAt', 'updatedAt', 'price', 'viewCount', 'make', 'model', 'title'];
  if (query.sortBy && validSortFields.includes(query.sortBy)) {
    sanitized.sortBy = query.sortBy;
  }
  
  const validSortOrders = ['ASC', 'DESC'];
  if (query.sortOrder && validSortOrders.includes(query.sortOrder.toUpperCase())) {
    sanitized.sortOrder = query.sortOrder.toUpperCase();
  }
  
  return sanitized;
};