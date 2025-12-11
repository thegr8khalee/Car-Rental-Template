// AdminComments.jsx
import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  Filter
} from 'lucide-react';

const AdminComments = () => {
  const {
    getCommentsStats,
    getComments,
    commentsStats,
    comments,
    totalCommentPages,
    currentCommentPage,
    // eslint-disable-next-line no-unused-vars
    commentFilter,
    isFetchingComments,
    commentError,
  } = useDashboardStore();

  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    getCommentsStats();
    getComments({ page: 1, limit: 10, status: selectedFilter });
  }, [getCommentsStats, getComments, selectedFilter]);

  const handlePageChange = (page) => {
    getComments({ page, limit: 10, status: selectedFilter });
  };

  const handleFilterChange = (status) => {
    setSelectedFilter(status);
    getComments({ page: 1, limit: 10, status });
  };

  if (isFetchingComments && !commentsStats) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (commentError && !commentsStats) {
    return <div className="text-center py-8 text-error">Error: {commentError}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Comments"
          value={commentsStats?.totalComments || 0}
          icon={<MessageSquare className="size-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={commentsStats?.pendingComments || 0}
          icon={<Clock className="size-6" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved"
          value={commentsStats?.approvedComments || 0}
          icon={<CheckCircle className="size-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={commentsStats?.rejectedComments || 0}
          icon={<XCircle className="size-6" />}
          color="bg-red-500"
        />
        <StatCard
          title="Spam"
          value={commentsStats?.spamComments || 0}
          icon={<AlertTriangle className="size-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Comments Section */}
      <div className="bg-base-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Comments</h2>
          
          {/* Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline gap-2">
              <Filter className="size-4" />
              {selectedFilter === 'all' ? 'All Comments' : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a onClick={() => handleFilterChange('all')}>All Comments</a></li>
              <li><a onClick={() => handleFilterChange('pending')}>Pending</a></li>
              <li><a onClick={() => handleFilterChange('approved')}>Approved</a></li>
              <li><a onClick={() => handleFilterChange('rejected')}>Rejected</a></li>
              <li><a onClick={() => handleFilterChange('spam')}>Spam</a></li>
            </ul>
          </div>
        </div>

        {/* Comments List */}
        {comments?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments found.
          </div>
        ) : (
          <div className="space-y-2">
            {comments?.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCommentPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {totalCommentPages > 3 && currentCommentPage > 3 && (
              <button
                onClick={() => handlePageChange(1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                1
              </button>
            )}
            {currentCommentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentCommentPage - 1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {[...Array(totalCommentPages)]
              .map((_, index) => index + 1)
              .filter(
                (page) =>
                  page >= currentCommentPage - 2 &&
                  page <= currentCommentPage + 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-circle btn-sm ${
                    page === currentCommentPage
                      ? 'btn-primary'
                      : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            {currentCommentPage < totalCommentPages && (
              <button
                onClick={() => handlePageChange(currentCommentPage + 1)}
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

const CommentCard = ({ comment }) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const dropdownRef = React.useRef(null);
  const { updateCommentStatus, isUpdatingComment } = useDashboardStore();

  React.useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight);
    }
  }, [isDropDownOpen]);

  const handleDropDownClick = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateCommentStatus(comment.id, newStatus);
      setIsDropDownOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

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
      pending: { text: 'Pending', class: 'badge-warning' },
      approved: { text: 'Approved', class: 'badge-success' },
      rejected: { text: 'Rejected', class: 'badge-error' },
      spam: { text: 'Spam', class: 'badge-ghost' },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const statusBadge = getStatusBadge(comment.status);

  return (
    <div className="bg-base-100 rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{comment.username}</span>
              <span className={`badge ${statusBadge.class}`}>{statusBadge.text}</span>
              {comment.isEdited && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              on: {comment.blog?.title || 'Unknown Blog'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(comment.createdAt)}
            </p>
          </div>
          
          <button
            onClick={handleDropDownClick}
            className="btn btn-circle btn-ghost btn-sm"
            disabled={isUpdatingComment}
          >
            <span
              className={`transition-transform duration-300 ease-in-out ${
                isDropDownOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <ChevronDown />
            </span>
          </button>
        </div>

        <p className="text-sm mt-2 whitespace-pre-wrap">{comment.content}</p>
      </div>

      {/* Dropdown Actions */}
      <div
        ref={dropdownRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isDropDownOpen ? `${dropdownHeight}px` : '0px',
          opacity: isDropDownOpen ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-2 gap-2 p-4 border-t">
          <button
            onClick={() => handleStatusChange('approved')}
            className="btn btn-success btn-sm"
            disabled={comment.status === 'approved' || isUpdatingComment}
          >
            <CheckCircle className="size-4" />
            Approve
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            className="btn btn-error btn-sm"
            disabled={comment.status === 'rejected' || isUpdatingComment}
          >
            <XCircle className="size-4" />
            Reject
          </button>
          <button
            onClick={() => handleStatusChange('spam')}
            className="btn btn-warning btn-sm"
            disabled={comment.status === 'spam' || isUpdatingComment}
          >
            <AlertTriangle className="size-4" />
            Mark Spam
          </button>
          <button
            onClick={() => handleStatusChange('pending')}
            className="btn btn-ghost btn-sm"
            disabled={comment.status === 'pending' || isUpdatingComment}
          >
            <Clock className="size-4" />
            Pending
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminComments;
