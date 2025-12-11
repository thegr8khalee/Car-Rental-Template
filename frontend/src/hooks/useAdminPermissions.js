// hooks/useAdminPermissions.js
import { useMemo } from 'react';
import { useAdminStore } from '../stores/useAdminStore.js';

/**
 * Custom hook for managing admin role-based permissions
 * @returns {Object} Permission functions and admin info
 */
export const useAdminPermissions = () => {
  const { admin, isAuthenticated } = useAdminStore();
  
  const permissions = useMemo(() => {
    if (!admin || !isAuthenticated) {
      return {
        role: null,
        isSuperAdmin: false,
        isEditor: false,
        isModerator: false,
        canManageAdmins: false,
        canManageUsers: false,
        canManageCars: false,
        canManageBlogs: false,
        canModerateContent: false,
        canViewRevenue: false,
        canViewUserStats: false,
        canDeleteContent: false,
        canBulkActions: false,
        hasPermission: () => false,
      };
    }

    const role = admin.role;
    const isSuperAdmin = role === 'super_admin';
    const isEditor = role === 'editor';
    const isModerator = role === 'moderator';

    return {
      role,
      isSuperAdmin,
      isEditor,
      isModerator,
      
      // Admin management
      canManageAdmins: isSuperAdmin,
      
      // User management
      canManageUsers: isSuperAdmin,
      
      // Car management
      canManageCars: isSuperAdmin || isEditor,
      canDeleteCars: isSuperAdmin,
      canEditCarPrices: isSuperAdmin || isEditor,
      canMarkCarsSold: isSuperAdmin || isEditor,
      
      // Blog management
      canManageBlogs: isSuperAdmin || isEditor,
      canDeleteBlogs: isSuperAdmin,
      canPublishBlogs: isSuperAdmin || isEditor,
      canEditOtherBlogs: isSuperAdmin,
      
      // Content moderation
      canModerateContent: isSuperAdmin || isEditor || isModerator,
      canDeleteComments: isSuperAdmin || isEditor,
      canDeleteReviews: isSuperAdmin || isEditor,
      canBulkActions: isSuperAdmin || isEditor,
      
      // Analytics and reporting
      canViewRevenue: isSuperAdmin,
      canViewUserStats: isSuperAdmin,
      canViewDetailedAnalytics: isSuperAdmin || isEditor,
      canExportData: isSuperAdmin,
      
      // System settings
      canManageSettings: isSuperAdmin,
      canManageNewsletter: isSuperAdmin || isEditor,
      
      /**
       * Check if admin has a specific permission
       * @param {string} permission - Permission to check
       * @returns {boolean} Whether admin has the permission
       */
      hasPermission: (permission) => {
        const permissionMap = {
          // Admin management
          'manage_admins': isSuperAdmin,
          'create_admin': isSuperAdmin,
          'delete_admin': isSuperAdmin,
          'edit_admin_roles': isSuperAdmin,
          
          // User management
          'view_users': isSuperAdmin,
          'manage_users': isSuperAdmin,
          'ban_users': isSuperAdmin,
          
          // Car management
          'create_car': isSuperAdmin || isEditor,
          'edit_car': isSuperAdmin || isEditor,
          'delete_car': isSuperAdmin,
          'edit_car_price': isSuperAdmin || isEditor,
          'mark_car_sold': isSuperAdmin || isEditor,
          'view_car_stats': isSuperAdmin || isEditor,
          
          // Blog management
          'create_blog': isSuperAdmin || isEditor,
          'edit_blog': isSuperAdmin || isEditor,
          'delete_blog': isSuperAdmin,
          'publish_blog': isSuperAdmin || isEditor,
          'edit_others_blog': isSuperAdmin,
          'view_blog_stats': isSuperAdmin || isEditor,
          
          // Content moderation
          'moderate_comments': isSuperAdmin || isEditor || isModerator,
          'moderate_reviews': isSuperAdmin || isEditor || isModerator,
          'delete_comment': isSuperAdmin || isEditor,
          'delete_review': isSuperAdmin || isEditor,
          'bulk_moderate': isSuperAdmin || isEditor,
          
          // Analytics
          'view_dashboard': isSuperAdmin || isEditor || isModerator,
          'view_revenue': isSuperAdmin,
          'view_user_analytics': isSuperAdmin,
          'view_detailed_stats': isSuperAdmin || isEditor,
          'export_data': isSuperAdmin,
          
          // System
          'manage_settings': isSuperAdmin,
          'manage_newsletter': isSuperAdmin || isEditor,
        };
        
        return permissionMap[permission] || false;
      },
      
      /**
       * Get allowed dashboard sections based on role
       * @returns {Array} Array of allowed dashboard sections
       */
      getAllowedDashboardSections: () => {
        const sections = ['overview', 'moderation', 'activity'];
        
        if (isSuperAdmin || isEditor) {
          sections.push('cars', 'blogs', 'analytics');
        }
        
        if (isSuperAdmin) {
          sections.push('users', 'revenue', 'settings', 'admins');
        }
        
        return sections;
      },
      
      /**
       * Get role display name
       * @returns {string} Human-readable role name
       */
      getRoleDisplayName: () => {
        const roleNames = {
          'super_admin': 'Super Administrator',
          'editor': 'Editor',
          'moderator': 'Moderator'
        };
        
        return roleNames[role] || 'Unknown Role';
      },
      
      /**
       * Get role color for UI
       * @returns {string} Color class or hex code
       */
      getRoleColor: () => {
        const roleColors = {
          'super_admin': 'text-red-600 bg-red-100',
          'editor': 'text-blue-600 bg-blue-100',
          'moderator': 'text-green-600 bg-green-100'
        };
        
        return roleColors[role] || 'text-gray-600 bg-gray-100';
      }
    };
  }, [admin, isAuthenticated]);

  return permissions;
};

/**
 * Higher-order component for protecting routes based on permissions
 * @param {React.Component} Component - Component to protect
 * @param {Array|string} requiredPermissions - Required permissions
 * @param {React.Component} FallbackComponent - Component to show if no permission
 * @returns {React.Component} Protected component
 */
export const withPermission = (Component, requiredPermissions, FallbackComponent = null) => {
  return (props) => {
    const { hasPermission, isAuthenticated } = useAdminPermissions();
    
    if (!isAuthenticated) {
      return FallbackComponent ? <FallbackComponent /> : <div>Access Denied</div>;
    }
    
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasRequiredPermission = permissions.some(permission => hasPermission(permission));
    
    if (!hasRequiredPermission) {
      return FallbackComponent ? <FallbackComponent /> : <div>Insufficient Permissions</div>;
    }
    
    return <Component {...props} />;
  };
};

/**
 * Hook for checking if current user can perform an action on specific content
 * @param {Object} content - Content object (blog, comment, etc.)
 * @param {string} action - Action to perform
 * @returns {boolean} Whether action is allowed
 */
export const useContentPermissions = (content, action) => {
  const { admin } = useAdminStore();
  const { hasPermission } = useAdminPermissions();
  
  return useMemo(() => {
    if (!admin || !content) return false;
    
    // Super admin can do everything
    if (admin.role === 'super_admin') return true;
    
    // Check if user owns the content
    const isOwner = content.authorId === admin.id || content.createdBy === admin.id;
    
    switch (action) {
      case 'edit':
        return isOwner || hasPermission('edit_others_blog');
      case 'delete':
        return hasPermission('delete_blog') || hasPermission('delete_comment');
      case 'moderate':
        return hasPermission('moderate_comments') || hasPermission('moderate_reviews');
      default:
        return false;
    }
  }, [admin, content, action, hasPermission]);
};

export default useAdminPermissions;