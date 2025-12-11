import React, { useState} from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Star,
  Bell,
  BellOff,
  User,
} from 'lucide-react';

const UserDetailPage = ({ user, setActiveSection }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [comments] = useState(user?.comments || []);
  const [reviews] = useState(user?.reviews || []);
  const [newsletterStatus] = useState(user?.newsletter || null);

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
      pending: { text: 'Pending', class: 'badge-warning', icon: Clock },
      approved: { text: 'Approved', class: 'badge-success', icon: CheckCircle },
      rejected: { text: 'Rejected', class: 'badge-error', icon: XCircle },
      spam: { text: 'Spam', class: 'badge-ghost', icon: AlertTriangle },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => {
      return acc + (
        (review.interiorRating || 0) +
        (review.exteriorRating || 0) +
        (review.comfortRating || 0) +
        (review.performanceRating || 0)
      ) / 4;
    }, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => setActiveSection('Users')}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">User Details</h1>
              <p className="text-gray-600">View user information and activity</p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-16 text-primary" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">{user.username}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="size-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    {user.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{user.phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {newsletterStatus ? (
                        <Bell className="size-5 text-green-500" />
                      ) : (
                        <BellOff className="size-5 text-gray-500" />
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Newsletter</p>
                        <p className="font-medium">
                          {newsletterStatus ? 'Subscribed' : 'Not Subscribed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Newsletter Details */}
                  {newsletterStatus && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold mb-2 text-green-900">Newsletter Subscription</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <span className="ml-2 font-medium capitalize">
                            {newsletterStatus.preferences?.frequency || 'Weekly'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Subscribed:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(newsletterStatus.createdAt)}
                          </span>
                        </div>
                        {newsletterStatus.preferences?.categories && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Categories:</span>
                            <div className="flex gap-2 mt-1">
                              {newsletterStatus.preferences.categories.map((cat, idx) => (
                                <span key={idx} className="badge badge-success badge-sm">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-4">
                  <div className="stat bg-primary/10 rounded-lg p-4">
                    <div className="stat-title text-xs">Total Comments</div>
                    <div className="stat-value text-2xl text-primary">{comments.length}</div>
                  </div>
                  <div className="stat bg-secondary/10 rounded-lg p-4">
                    <div className="stat-title text-xs">Total Reviews</div>
                    <div className="stat-value text-2xl text-secondary">{reviews.length}</div>
                  </div>
                  {reviews.length > 0 && (
                    <div className="stat bg-accent/10 rounded-lg p-4">
                      <div className="stat-title text-xs">Avg Rating</div>
                      <div className="stat-value text-2xl text-accent">
                        {calculateAverageRating()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-100 mb-6">
            <a
              className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </a>
            <a
              className={`tab ${activeTab === 'comments' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Comments ({comments.length})
            </a>
            <a
              className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </a>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Comments */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Recent Comments
                  </h3>
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet</p>
                  ) : (
                    <div className="space-y-3">
                      {comments.slice(0, 3).map((comment) => {
                        const status = getStatusBadge(comment.status);
                        return (
                          <div key={comment.id} className="p-3 bg-base-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`badge ${status.class} badge-sm`}>
                                {status.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-2">{comment.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title flex items-center gap-2">
                    <Star className="size-5" />
                    Recent Reviews
                  </h3>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((review) => {
                        const avgRating = (
                          (review.interiorRating || 0) +
                          (review.exteriorRating || 0) +
                          (review.comfortRating || 0) +
                          (review.performanceRating || 0)
                        ) / 4;
                        const status = getStatusBadge(review.status);
                        
                        return (
                          <div key={review.id} className="p-3 bg-base-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`badge ${status.class} badge-sm`}>
                                  {status.text}
                                </span>
                                <div className="flex items-center">
                                  <Star className="size-3 fill-primary text-primary" />
                                  <span className="text-sm ml-1">{avgRating.toFixed(1)}</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-2">{review.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">All Comments</h3>
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const status = getStatusBadge(comment.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={comment.id} className="p-4 bg-base-200 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`badge ${status.class} gap-1`}>
                              <StatusIcon className="size-3" />
                              {status.text}
                            </span>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </p>
                              {comment.isEdited && (
                                <p className="text-xs text-gray-400">
                                  Edited: {formatDate(comment.editedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          {comment.blogId && (
                            <p className="text-xs text-gray-500 mt-2">
                              Blog ID: {comment.blogId}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">All Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const status = getStatusBadge(review.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={review.id} className="p-4 bg-base-200 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`badge ${status.class} gap-1`}>
                              <StatusIcon className="size-3" />
                              {status.text}
                            </span>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </p>
                              {review.isEdited && (
                                <p className="text-xs text-gray-400">
                                  Edited: {formatDate(review.editedAt)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Ratings */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
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
                              <RatingDisplay label="Performance" value={review.performanceRating} />
                            )}
                          </div>

                          <p className="text-sm whitespace-pre-wrap">{review.content}</p>
                          {review.carId && (
                            <p className="text-xs text-gray-500 mt-2">
                              Car ID: {review.carId}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
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
        <span className="text-xs ml-1">{value}</span>
      </div>
    </div>
  );
};

export default UserDetailPage;
