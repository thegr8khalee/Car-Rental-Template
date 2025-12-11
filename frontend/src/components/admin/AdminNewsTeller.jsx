// AdminNewsletter.jsx
import React, { useEffect } from 'react';
import {
  Mail,
  TrendingUp,
  Send,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminOpsStore } from '../../store/useAdminOpsStore';

const AdminNewsletter = () => {
  const {
    getNewsletterStats,
    getRecentBroadcasts,
    newsletterStats,
    recentBroadcasts,
    totalBroadcastPages,
    currentBroadcastPage,
    isFetchingNewsletter,
    newsletterError,
  } = useAdminOpsStore();

  console.log(newsletterStats)

  const navigate = useNavigate();

  useEffect(() => {
    getNewsletterStats();
    getRecentBroadcasts({ page: 1, limit: 10 });
  }, [getNewsletterStats, getRecentBroadcasts]);

  const handlePageChange = (page) => {
    getRecentBroadcasts({ page, limit: 10 });
  };

  const handleNewBroadcast = () => {
    navigate('/admin/broadcast/new');
  };

  if (isFetchingNewsletter && !newsletterStats) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (newsletterError && !newsletterStats) {
    return (
      <div className="text-center py-8 text-error">
        Error: {newsletterError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Subscribers"
          value={newsletterStats?.totalSubscribers || 0}
          icon={<Users className="size-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="New This Month"
          value={newsletterStats?.newThisMonth || 0}
          icon={<TrendingUp className="size-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Broadcasts"
          value={newsletterStats?.totalBroadcasts || 0}
          icon={<Send className="size-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Unsubscribed"
          value={newsletterStats?.unsubscribedCount || 0}
          icon={<Mail className="size-6" />}
          color="bg-red-500"
        />
      </div>

      {/* Recent Broadcasts Section */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Broadcasts</h2>
          <button
            onClick={handleNewBroadcast}
            className="btn btn-primary rounded-full flex items-center gap-2"
          >
            <Plus className="size-5" />
            New Broadcast
          </button>
        </div>

        {/* Broadcasts List */}
        {recentBroadcasts?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No broadcasts sent yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentBroadcasts?.map((broadcast) => (
              <BroadcastCard key={broadcast.id} broadcast={broadcast} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalBroadcastPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {totalBroadcastPages > 3 && currentBroadcastPage > 3 && (
              <button
                onClick={() => handlePageChange(1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                1
              </button>
            )}
            {currentBroadcastPage > 1 && (
              <button
                onClick={() => handlePageChange(currentBroadcastPage - 1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {[...Array(totalBroadcastPages)]
              .map((_, index) => index + 1)
              .filter(
                (page) =>
                  page >= currentBroadcastPage - 2 &&
                  page <= currentBroadcastPage + 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-circle btn-sm ${
                    page === currentBroadcastPage
                      ? 'btn-primary'
                      : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            {currentBroadcastPage < totalBroadcastPages && (
              <button
                onClick={() => handlePageChange(currentBroadcastPage + 1)}
                className="btn btn-primary btn-sm rounded-full"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-base-100 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

const BroadcastCard = ({ broadcast }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { text: 'Completed', class: 'badge-success' },
      sending: { text: 'Sending', class: 'badge-warning' },
      failed: { text: 'Failed', class: 'badge-error' },
      draft: { text: 'Draft', class: 'badge-ghost' },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const statusBadge = getStatusBadge(broadcast.status);

  return (
    <div className="bg-base-100 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{broadcast.subject}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="size-4" />
              {formatDate(broadcast.sentAt || broadcast.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              {broadcast.recipientCount} recipients
            </span>
          </div>
        </div>
        <span className={`badge ${statusBadge.class}`}>{statusBadge.text}</span>
      </div>

      {broadcast.status === 'completed' && (
        <div className="flex gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="size-4" />
            {broadcast.successCount} sent
          </span>
          {broadcast.failureCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="size-4" />
              {broadcast.failureCount} failed
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
