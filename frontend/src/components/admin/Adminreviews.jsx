// AdminReviews.jsx
import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import {
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  Filter,
  Car as CarIcon,
} from 'lucide-react';

const AdminReviews = () => {
  const {
    getReviewsStats,
    getReviews,
    reviewsStats,
    reviews,
    totalReviewPages,
    currentReviewPage,
    // eslint-disable-next-line no-unused-vars
    reviewFilter,
    isFetchingReviews,
    reviewError,
  } = useDashboardStore();

  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    getReviewsStats();
    getReviews({ page: 1, limit: 10, status: selectedFilter });
  }, [getReviewsStats, getReviews]);

  const handlePageChange = (page) => {
    getReviews({ page, limit: 10, status: selectedFilter });
  };

  const handleFilterChange = (status) => {
    setSelectedFilter(status);
    getReviews({ page: 1, limit: 10, status });
  };

  if (isFetchingReviews && !reviewsStats) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (reviewError && !reviewsStats) {
    return (
      <div className="text-center py-8 text-error">Error: {reviewError}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Reviews"
          value={reviewsStats?.totalReviews || 0}
          icon={<Star className="size-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={reviewsStats?.pendingReviews || 0}
          icon={<Clock className="size-6" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved"
          value={reviewsStats?.approvedReviews || 0}
          icon={<CheckCircle className="size-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={reviewsStats?.rejectedReviews || 0}
          icon={<XCircle className="size-6" />}
          color="bg-red-500"
        />
        <StatCard
          title="Spam"
          value={reviewsStats?.spamReviews || 0}
          icon={<AlertTriangle className="size-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Average Ratings */}
      {reviewsStats?.averageRatings && (
        <div className="bg-base-100 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">
            Average Ratings (Approved)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RatingItem
              label="Interior"
              value={reviewsStats.averageRatings.interior}
            />
            <RatingItem
              label="Exterior"
              value={reviewsStats.averageRatings.exterior}
            />
            <RatingItem
              label="Comfort"
              value={reviewsStats.averageRatings.comfort}
            />
            <RatingItem
              label="Performance"
              value={reviewsStats.averageRatings.performance}
            />
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-base-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reviews</h2>

          {/* Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline gap-2">
              <Filter className="size-4" />
              {selectedFilter === 'all'
                ? 'All Reviews'
                : selectedFilter.charAt(0).toUpperCase() +
                  selectedFilter.slice(1)}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
            >
              <li>
                <a onClick={() => handleFilterChange('all')}>All Reviews</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('pending')}>Pending</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('approved')}>Approved</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('rejected')}>Rejected</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('spam')}>Spam</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Reviews List */}
        {reviews?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews found.
          </div>
        ) : (
          <div className="space-y-2">
            {reviews?.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalReviewPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {totalReviewPages > 3 && currentReviewPage > 3 && (
              <button
                onClick={() => handlePageChange(1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                1
              </button>
            )}
            {currentReviewPage > 1 && (
              <button
                onClick={() => handlePageChange(currentReviewPage - 1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {[...Array(totalReviewPages)]
              .map((_, index) => index + 1)
              .filter(
                (page) =>
                  page >= currentReviewPage - 2 && page <= currentReviewPage + 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-circle btn-sm ${
                    page === currentReviewPage ? 'btn-primary' : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            {currentReviewPage < totalReviewPages && (
              <button
                onClick={() => handlePageChange(currentReviewPage + 1)}
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

const RatingItem = ({ label, value }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <div className="flex items-center gap-1">
        <Star className="size-4 fill-primary text-primary" />
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const dropdownRef = React.useRef(null);
  const { updateReviewStatus, isUpdatingReview } = useDashboardStore();

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
      await updateReviewStatus(review.id, newStatus);
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

  const statusBadge = getStatusBadge(review.status);

  return (
    <div className="bg-base-100 rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {review.name || review.user?.username}
              </span>
              <span className={`badge ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
              {review.isEdited && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <CarIcon className="size-4" />
              {review.car
                ? `${review.car.make} ${review.car.model} ${review.car.year}`
                : 'Unknown Car'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(review.createdAt)}
            </p>
          </div>

          <button
            onClick={handleDropDownClick}
            className="btn btn-circle btn-ghost btn-sm"
            disabled={isUpdatingReview}
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

        {/* Ratings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3">
          {review.interiorRating && (
            <RatingDisplay label="Interior" value={review.interiorRating} />
          )}
          {review.exteriorRating && (
            <RatingDisplay label="Exterior" value={review.exteriorRating} />
          )}
          {review.comfortRating && (
            <RatingDisplay label="Comfort" value={review.comfortRating} />
          )}
          {review.performanceRating && (
            <RatingDisplay
              label="Performance"
              value={review.performanceRating}
            />
          )}
        </div>

        <p className="text-sm mt-2 whitespace-pre-wrap">{review.content}</p>
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
            disabled={review.status === 'approved' || isUpdatingReview}
          >
            <CheckCircle className="size-4" />
            Approve
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            className="btn btn-error btn-sm"
            disabled={review.status === 'rejected' || isUpdatingReview}
          >
            <XCircle className="size-4" />
            Reject
          </button>
          <button
            onClick={() => handleStatusChange('spam')}
            className="btn btn-warning btn-sm"
            disabled={review.status === 'spam' || isUpdatingReview}
          >
            <AlertTriangle className="size-4" />
            Mark Spam
          </button>
          <button
            onClick={() => handleStatusChange('pending')}
            className="btn btn-ghost btn-sm"
            disabled={review.status === 'pending' || isUpdatingReview}
          >
            <Clock className="size-4" />
            Pending
          </button>
        </div>
      </div>
    </div>
  );
};

const RatingDisplay = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`size-3 ${
              i < value ? 'fill-primary text-primary' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;
