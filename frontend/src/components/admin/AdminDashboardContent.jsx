// src/components/Admin/AdminDashboardContent.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  CarFront,
  MessageSquareMore,
  MessageSquareText,
  Newspaper,
  StickyNote,
  UserRound,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  Clock,
  BarChart3,
  Activity,
  RefreshCw,
  Loader2,
  Package,
  Users,
  Star,
  RefreshCcw,
} from 'lucide-react';
import { useUserAuthStore } from '../../store/useUserAuthStore';
import { useDashboardStore } from '../../store/useDasboardStore';

const AdminDashboardContent = () => {
  const { authUser } = useUserAuthStore();
  const navigate = useNavigate();

  // Dashboard store
  const {
    dashboardStats,
    carStats,
    blogStats,
    userStats,
    sellingToUs,
    revenueStats,
    recentActivity,
    topPerformers,
    isLoading,
    error,
    lastUpdated,
    refreshAllStats,
    needsRefresh,
  } = useDashboardStore();

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      if (!dashboardStats || needsRefresh()) {
        await refreshAllStats(authUser?.role || 'editor');
      }
    };

    if (authUser?.role) {
      loadDashboard();
    }
  }, [authUser?.role, dashboardStats, needsRefresh, refreshAllStats]);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAllStats(authUser?.role || 'editor');
  };

  // Calculate trends from percentage change
  const formatTrend = (percentageChange) => {
    if (percentageChange === undefined || percentageChange === null)
      return { change: '+0%', trend: 'up' };
    return {
      change: `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(
        0
      )}%`,
      trend: percentageChange >= 0 ? 'up' : 'down',
    };
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Check if user can view revenue
  const canViewRevenue = authUser?.role === 'admin';

  console.log('dashboard stats:', dashboardStats);
  // Primary business stats
  const primaryStats = dashboardStats
    ? [
        {
          label: 'Total Cars',
          value: dashboardStats.cars?.total || 0,
          change: carStats?.monthlyTrend
            ? formatTrend(carStats.monthlyTrend.percentageChange).change
            : '+0%',
          trend: carStats?.monthlyTrend
            ? formatTrend(carStats.monthlyTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.cars?.availableCars || 0} available`,
          icon: CarFront,
          color: 'bg-blue-500',
        },
        {
          label: 'Cars Sold',
          value: dashboardStats.cars?.sold || 0,
          change: carStats?.monthlyTrend
            ? formatTrend(carStats.monthlyTrend.percentageChange).change
            : '+0%',
          trend: carStats?.monthlyTrend
            ? formatTrend(carStats.monthlyTrend.percentageChange).trend
            : 'up',
          subtitle: `${
            dashboardStats.cars?.carsAddedThisMonth || 0
          } added this month`,
          icon: Car,
          color: 'bg-green-500',
        },
        {
          label: 'Inventory Rate',
          value: `${Number(dashboardStats.cars?.inventoryRate || 0).toFixed(
            1
          )}%`,
          change: '+2%',
          trend: 'up',
          subtitle: 'Stock turnover',
          icon: Package,
          color: 'bg-indigo-500',
        },
        ...(canViewRevenue && dashboardStats.revenue
          ? [
              {
                label: 'Total Revenue',
                value: dashboardStats.revenue?.totalRevenue,

                change: revenueStats?.monthlyTrend
                  ? `${
                      revenueStats.monthlyTrend[
                        revenueStats.monthlyTrend.length - 1
                      ]?.revenue >
                      revenueStats.monthlyTrend[
                        revenueStats.monthlyTrend.length - 2
                      ]?.revenue
                        ? '+'
                        : ''
                    }${(
                      ((revenueStats.monthlyTrend[
                        revenueStats.monthlyTrend.length - 1
                      ]?.revenue -
                        revenueStats.monthlyTrend[
                          revenueStats.monthlyTrend.length - 2
                        ]?.revenue) /
                        revenueStats.monthlyTrend[
                          revenueStats.monthlyTrend.length - 2
                        ]?.revenue) *
                      100
                    ).toFixed(0)}%`
                  : '+0%',
                trend: 'up',
                subtitle:
                  dashboardStats.revenue?.monthlyRevenue + ' this month',
                icon: DollarSign,
                color: 'bg-emerald-500',
              },
            ]
          : []),
      ]
    : [];

  const sellingToUsStats = dashboardStats
    ? [
        {
          label: 'Selling to Us',
          value: dashboardStats.sellingToUs?.thisMonth || 0,
          change: sellingToUs?.monthlyTrend
            ? formatTrend(sellingToUs?.monthlyTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.monthlyTrend
            ? formatTrend(sellingToUs?.monthlyTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastMonth || 0} last month`,
          icon: Car,
          color: 'bg-green-500',
        },
        {
          label: 'Yearly Selling to Us',
          value: dashboardStats.sellingToUs?.thisYear || 0,
          change: sellingToUs?.yearlyTrend
            ? formatTrend(sellingToUs?.yearlyTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.yearlyTrend
            ? formatTrend(sellingToUs?.yearlyTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastYear || 0} last year`,
          icon: Car,
          color: 'bg-green-500',
        },
        {
          label: 'Total Selling to Us',
          value: dashboardStats.sellingToUs?.total || 0,
          change: sellingToUs?.totalTrend
            ? formatTrend(sellingToUs?.totalTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.totalTrend
            ? formatTrend(sellingToUs?.totalTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastTotal || 0} last year`,
          icon: Car,
          color: 'bg-green-500',
        },
        {
          label: 'Pending Submissions',
          value: dashboardStats.sellingToUs?.pending || 0,
          change: sellingToUs?.pendingTrend
            ? formatTrend(sellingToUs?.pendingTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.pendingTrend
            ? formatTrend(sellingToUs?.pendingTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastPending || 0} last month`,
          icon: Car,
          color: 'bg-green-500',
        },
        { label: 'Offers Sent',
          value: dashboardStats.sellingToUs?.offerSent || 0,
          change: sellingToUs?.offerSentTrend
            ? formatTrend(sellingToUs?.offerSentTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.offerSentTrend
            ? formatTrend(sellingToUs?.offerSentTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastOfferSent || 0} last month`,
          icon: Car,
          color: 'bg-green-500',
        },
        { label: 'Offers Accepted',
          value: dashboardStats.sellingToUs?.accepted || 0,
          change: sellingToUs?.acceptedTrend
            ? formatTrend(sellingToUs?.acceptedTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.acceptedTrend
            ? formatTrend(sellingToUs?.acceptedTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastAccepted || 0} last month`,
          icon: Car,
          color: 'bg-green-500',
        },
        { label: 'Offers Rejected',
          value: dashboardStats.sellingToUs?.rejected || 0,
          change: sellingToUs?.rejectedTrend
            ? formatTrend(sellingToUs?.rejectedTrend.percentageChange).change
            : '+0%',
          trend: sellingToUs?.rejectedTrend
            ? formatTrend(sellingToUs?.rejectedTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.sellingToUs?.lastRejected || 0} last month`,
          icon: Car,
          color: 'bg-green-500',
        },
      ]
    : [];

  // Content performance stats
  const contentStats = dashboardStats
    ? [
        {
          label: 'Blog Posts',
          value: dashboardStats.blogs?.total || 0,
          change: blogStats?.monthlyTrend
            ? formatTrend(blogStats.monthlyTrend.percentageChange).change
            : '+0%',
          trend: blogStats?.monthlyTrend
            ? formatTrend(blogStats.monthlyTrend.percentageChange).trend
            : 'up',
          subtitle: `${dashboardStats.blogs?.publishedBlogs || 0} published`,
          icon: StickyNote,
          color: 'bg-purple-500',
        },
        {
          label: 'Total Views',
          value: formatNumber(dashboardStats.blogs?.totalViews || 0),
          change: '+22%',
          trend: 'up',
          subtitle: 'This month',
          icon: Eye,
          color: 'bg-indigo-500',
        },
        {
          label: 'Avg Views',
          value: Math.round(dashboardStats.blogs?.averageViews || 0),
          change: '+3%',
          trend: 'up',
          subtitle: 'Per blog post',
          icon: Activity,
          color: 'bg-orange-500',
        },
        {
          label: 'Draft Posts',
          value: dashboardStats.blogs?.drafts || 0,
          change: null,
          trend: null,
          subtitle: 'Unpublished',
          icon: StickyNote,
          color: 'bg-gray-500',
        },
      ]
    : [];

  // User analytics stats
  const userAnalyticsStats = dashboardStats
    ? [
        {
          label: 'Total Users',
          value: dashboardStats.users?.total || 0,
          change: userStats?.monthlyGrowth
            ? formatTrend(userStats.monthlyGrowth.percentageChange).change
            : '+0%',
          trend: userStats?.monthlyGrowth
            ? formatTrend(userStats.monthlyGrowth.percentageChange).trend
            : 'up',
          subtitle: `${
            dashboardStats.users?.newUsersThisMonth || 0
          } new this month`,
          icon: UserRound,
          color: 'bg-cyan-500',
        },
        {
          label: 'Newsletter',
          value: dashboardStats.engagement?.newsletterSubscribers || 0,
          change: '+7%',
          trend: 'up',
          subtitle: 'Subscribers',
          icon: Newspaper,
          color: 'bg-teal-500',
        },
        {
          label: 'Total Reviews',
          value: dashboardStats.engagement?.totalReviews || 0,
          change: '+12%',
          trend: 'up',
          subtitle: `${
            dashboardStats.engagement?.totalReviews ? 4.8 : 0
          } avg rating`,
          icon: Star,
          color: 'bg-yellow-500',
        },
        {
          label: 'Active Users',
          value: dashboardStats.recentActivity?.newUsersThisMonth || 0,
          change: '+15%',
          trend: 'up',
          subtitle: 'This month',
          icon: Users,
          color: 'bg-pink-500',
        },
      ]
    : [];

  // Moderation queue stats
  const moderationQueueStats = dashboardStats
    ? [
        {
          label: 'Pending Comments',
          value: dashboardStats.engagement?.pendingComments || 0,
          urgent: (dashboardStats.engagement?.pendingComments || 0) > 10,
          icon: MessageSquareMore,
          color: 'bg-yellow-500',
          subtitle: `${dashboardStats.engagement?.totalComments || 0} total`,
        },
        {
          label: 'Pending Reviews',
          value: dashboardStats.engagement?.pendingReviews || 0,
          urgent: (dashboardStats.engagement?.pendingReviews || 0) > 5,
          icon: MessageSquareText,
          color: 'bg-blue-500',
          subtitle: `${dashboardStats.engagement?.totalReviews || 0} total`,
        },
        {
          label: 'Recent Activity',
          value:
            (dashboardStats.recentActivity?.newCommentsThisWeek || 0) +
            (dashboardStats.recentActivity?.newReviewsThisWeek || 0),
          urgent: false,
          icon: Activity,
          color: 'bg-green-500',
          subtitle: 'This week',
        },
      ]
    : [];

  // Recent activity data
  const allRecentActivities = [
    ...(recentActivity?.recentCars?.map((car) => ({
      action: 'New car added',
      item: `${car.make || ''} ${car.model}`.trim(),
      time: new Date(car.createdAt).toLocaleString(),
      icon: Car,
    })) || []),
    ...(recentActivity?.recentBlogs?.map((blog) => ({
      action: 'Blog published',
      item: blog.title,
      time: new Date(blog.createdAt).toLocaleString(),
      icon: StickyNote,
    })) || []),
    ...(recentActivity?.recentComments?.map((comment) => ({
      action: 'New comment',
      item: comment.content.substring(0, 50) + '...',
      time: new Date(comment.createdAt).toLocaleString(),
      icon: MessageSquareText,
    })) || []),
    ...(recentActivity?.recentReviews?.map((review) => ({
      action: 'Review submitted',
      item: review.content.substring(0, 50) + '...',
      time: new Date(review.createdAt).toLocaleString(),
      icon: Star,
    })) || []),
  ];

  const totalRecentActivityLength = allRecentActivities.length;

  // then slice if you only want to show 8
  const recentActivityData = allRecentActivities.slice(0, 8);

  // Top performers data
  const topPerformersData = topPerformers
    ? [
        {
          title: 'Top Blogs',
          items:
            topPerformers.topBlogs?.slice(0, 3).map((blog) => ({
              name: blog.title,
              value: formatNumber(blog.views),
              subtitle: 'views',
            })) || [],
        },
        {
          title: 'Top Car Makes',
          items:
            topPerformers.topSellingMakes?.slice(0, 3).map((make) => ({
              name: make.make,
              value: make.soldCount,
              subtitle: 'sold',
            })) || [],
        },
      ]
    : [];

  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;

    return (
      <div className="stat shadow-lg bg-base-100 rounded-2xl p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-xl text-primary`}>
            <IconComponent className={`size-8`} />
          </div>
          {stat.change && (
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                stat.trend === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {stat.trend === 'up' ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>{stat.change}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="font-bold text-3xl text-base-content">
            {stat.value}
          </div>
          <div className="text-base font-medium text-base-content opacity-70">
            {stat.label}
          </div>
          {stat.subtitle && (
            <div className="text-sm text-base-content opacity-50">
              {stat.subtitle}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ModerationCard = ({ stat }) => {
    const IconComponent = stat.icon;

    return (
      <div
        className={`stat shadow-lg rounded-2xl p-4 hover:shadow-xl transition-shadow ${
          stat.urgent
            ? 'bg-warning bg-opacity-10 border border-warning'
            : 'bg-base-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={` text-primary`}>
              <IconComponent className={`size-8 `} />
            </div>
            <div>
              <div className="font-bold text-xl">{stat.value}</div>
              <div className="text-sm opacity-70">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs opacity-50">{stat.subtitle}</div>
              )}
            </div>
          </div>
          {stat.urgent && (
            <div className="badge badge-warning badge-sm">Urgent</div>
          )}
        </div>
      </div>
    );
  };

  const TopPerformersCard = ({ stat }) => {
    const IconComponent = stat.icon;

    return (
      <div className="bg-base-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
              <IconComponent
                className={`size-5 ${stat.color.replace('bg-', 'text-')}`}
              />
            </div>
            <h4 className="font-semibold text-lg text-base-content">
              {stat.title}
            </h4>
          </div>

          {stat.viewAllLink && (
            <button
              className="btn btn-ghost btn-xs text-primary"
              onClick={() => navigate(stat.viewAllLink)}
            >
              View All
              <ArrowUpRight className="size-3 ml-1" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {stat.items && stat.items.length > 0 ? (
            stat.items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                onClick={item.onClick}
              >
                {/* Ranking & Content */}
                <div className="flex items-center space-x-3 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={`badge badge-sm font-bold ${
                      index === 0
                        ? 'badge-warning'
                        : index === 1
                        ? 'badge-neutral'
                        : 'badge-ghost'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base-content truncate">
                      {item.name || item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-sm text-base-content opacity-60">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center space-x-2 ml-2">
                  <div className="text-right">
                    <div className="font-semibold text-base-content">
                      {typeof item.value === 'number'
                        ? item.value.toLocaleString()
                        : item.value}
                    </div>
                    {item.metric && (
                      <div className="text-xs text-base-content opacity-50">
                        {item.metric}
                      </div>
                    )}
                  </div>

                  {item.trend && (
                    <div
                      className={`flex items-center space-x-1 ${
                        item.trend === 'up' ? 'text-success' : 'text-error'
                      }`}
                    >
                      {item.trend === 'up' ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {item.trendValue && (
                        <span className="text-xs font-medium">
                          {item.trendValue}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-base-content opacity-50">
              <div
                className={`p-3 rounded-lg ${stat.color} bg-opacity-10 w-fit mx-auto mb-3`}
              >
                <IconComponent
                  className={`size-8 ${stat.color.replace(
                    'bg-',
                    'text-'
                  )} opacity-50`}
                />
              </div>
              <p className="text-sm">
                No {stat.title.toLowerCase()} data available
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {stat.summary && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="grid grid-cols-2 gap-4">
              {stat.summary.map((summaryItem, index) => (
                <div key={index} className="text-center">
                  <div className="font-semibold text-base-content">
                    {summaryItem.value}
                  </div>
                  <div className="text-xs text-base-content opacity-60">
                    {summaryItem.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error && !dashboardStats) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="size-6" />
        <span>Error loading dashboard: {error}</span>
        <button className="btn btn-sm" onClick={handleRefresh}>
          <RefreshCw className="size-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-base-content">
            Dashboard Overview
          </h2>
          <p className="text-base-content opacity-60 mt-1">
            Welcome back, {authUser?.username}! Here's what's happening with
            your dealership.
          </p>
          {lastUpdated && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-base-content opacity-50">
              <Clock className="size-4" />
              <span>
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Admin Profile Card & Refresh */}
        <div className="flex items-center space-x-4">
          <div className="stat shadow-lg rounded-2xl flex flex-row p-4 bg-primary text-secondary min-w-fit">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={
                      authUser?.avatar ||
                      'https://img.daisyui.com/images/profile/demo/anakeen@192.webp'
                    }
                    alt="Admin avatar"
                  />
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {authUser?.username}
                </div>
                <div className="text-sm opacity-80">
                  {authUser?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn bg-transparent border-0  btn-circle btn-sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Primary Stats - Cars and Revenue */}
      {primaryStats.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            Business Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {primaryStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Selling to Us Stats */}
      {sellingToUsStats.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            Selling to Us Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellingToUsStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Content Stats */}
      {contentStats.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            Content Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* User Stats */}
      {userAnalyticsStats.length > 0 && authUser?.role !== 'moderator' && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            User Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userAnalyticsStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/** top performers */}
      {topPerformersData.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content flex items-center space-x-2">
            <AlertCircle className="size-5 text-warning" />
            <span>Top Performers</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerformersData.map((stat, index) => (
              <topPerformersData key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      {moderationQueueStats.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content flex items-center space-x-2">
            <AlertCircle className="size-5 text-warning" />
            <span>Content Moderation</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moderationQueueStats.map((stat, index) => (
              <ModerationCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            Recent Activity{' '}
            <span className="font-regular text-primary">
              ({totalRecentActivityLength})
            </span>
          </h3>
          <div className="bg-base-100 rounded-2xl shadow-lg p-6 max-h-100 overflow-y-auto">
            {recentActivityData.length > 0 ? (
              <div className="space-y-4">
                {recentActivityData.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 pl-0 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="">
                        <IconComponent className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-base-content">
                          {activity.action}
                        </div>
                        <div className="text-sm text-base-content opacity-70">
                          {activity.item}
                        </div>
                      </div>
                      <div className="text-sm text-base-content opacity-50">
                        {activity.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content opacity-50">
                <Activity className="size-12 mx-auto mb-4" />
                <p>No recent activity available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-base-content">
            Quick Actions
          </h3>
          <div className="bg-base-100 rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              <button
                className="btn btn-primary w-full rounded-xl text-lg font-medium"
                onClick={() => navigate('/admin/cars/new')}
              >
                <Car className="size-5" />
                Add New Car
              </button>

              <button
                className="btn btn-outline btn-primary w-full rounded-xl text-lg font-medium"
                onClick={() => navigate('/admin/blogs/new')}
              >
                <StickyNote className="size-5" />
                Create Blog Post
              </button>

              <button
                className="btn btn-outline btn-secondary w-full rounded-xl text-lg font-medium"
                onClick={() => navigate('/admin/moderation')}
              >
                <MessageSquareMore className="size-5" />
                Review Comments
                {(dashboardStats?.engagement?.pendingComments || 0) > 0 && (
                  <div className="badge badge-warning badge-sm ml-2">
                    {dashboardStats.engagement.pendingComments}
                  </div>
                )}
              </button>

              <button
                className="btn btn-outline btn-accent w-full rounded-xl text-lg font-medium"
                onClick={() => navigate('/admin/analytics')}
              >
                <BarChart3 className="size-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformersData.length > 0 &&
        topPerformersData.some((section) => section.items.length > 0) && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-base-content">
              Top Performers
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topPerformersData.map(
                (section, index) =>
                  section.items.length > 0 && (
                    <div
                      key={index}
                      className="bg-base-100 rounded-2xl shadow-lg p-6"
                    >
                      <h4 className="font-semibold text-lg mb-4 text-base-content">
                        {section.title}
                      </h4>
                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between p-3 rounded-lg bg-base-200"
                          >
                            <div className="font-medium text-base-content truncate flex-1 mr-2">
                              {item.name}
                            </div>
                            <div className="text-sm text-base-content opacity-70">
                              {item.value} {item.subtitle}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboardContent;
