import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Filter,
  ChevronDown,
  ChevronLeft,
  Phone,
  Mail,
  Car,
  Calendar,
  Gauge,
  Image,
  ImageIcon,
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDasboardStore';

const AdminSellingToUs = () => {
  const {
    getSellSubmissionsStats,
    getSellSubmissions,
    sellSubmissionsStats,
    sellSubmissions,
    totalSellPages,
    currentSellPage,
    isFetchingSellSubmissions,
    sellSubmissionError,
  } = useDashboardStore();

  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    getSellSubmissionsStats();
    getSellSubmissions({ page: 1, limit: 10, status: selectedFilter });
  }, [getSellSubmissionsStats, getSellSubmissions]);

  const handlePageChange = (page) => {
    getSellSubmissions({ page, limit: 10, status: selectedFilter });
  };

  const handleFilterChange = (status) => {
    setSelectedFilter(status);
    getSellSubmissions({ page: 1, limit: 10, status });
  };

  if (isFetchingSellSubmissions && !sellSubmissionsStats) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (sellSubmissionError && !sellSubmissionsStats) {
    return (
      <div className="text-center py-8 text-error">
        Error: {sellSubmissionError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={sellSubmissionsStats?.totalSubmissions || 0}
          icon={<Car className="size-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={sellSubmissionsStats?.pendingSubmissions || 0}
          icon={<Clock className="size-6" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Offers Sent"
          value={sellSubmissionsStats?.offersSent || 0}
          icon={<Send className="size-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Accepted"
          value={sellSubmissionsStats?.acceptedOffers || 0}
          icon={<CheckCircle className="size-6" />}
          color="bg-emerald-500"
        />
      </div>

      {/* Submissions Section */}
      <div className="bg-base-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sell Submissions</h2>

          {/* Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline gap-2">
              <Filter className="size-4" />
              {selectedFilter === 'all'
                ? 'All Submissions'
                : selectedFilter === 'Pending'
                ? 'Pending'
                : selectedFilter === 'Offer Sent'
                ? 'Offers Sent'
                : selectedFilter === 'Accepted'
                ? 'Accepted'
                : 'Rejected'}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
            >
              <li>
                <a onClick={() => handleFilterChange('all')}>All Submissions</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('Pending')}>Pending</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('Offer Sent')}>Offers Sent</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('Accepted')}>Accepted</a>
              </li>
              <li>
                <a onClick={() => handleFilterChange('Rejected')}>Rejected</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Submissions List */}
        {sellSubmissions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No submissions found.
          </div>
        ) : (
          <div className="space-y-2">
            {sellSubmissions?.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalSellPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {totalSellPages > 3 && currentSellPage > 3 && (
              <button
                onClick={() => handlePageChange(1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                1
              </button>
            )}
            {currentSellPage > 1 && (
              <button
                onClick={() => handlePageChange(currentSellPage - 1)}
                className="btn btn-circle btn-primary btn-sm"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {[...Array(totalSellPages)]
              .map((_, index) => index + 1)
              .filter(
                (page) =>
                  page >= currentSellPage - 2 && page <= currentSellPage + 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-circle btn-sm ${
                    page === currentSellPage ? 'btn-primary' : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            {currentSellPage < totalSellPages && (
              <button
                onClick={() => handlePageChange(currentSellPage + 1)}
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

const SubmissionCard = ({ submission }) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [offerAmount, setOfferAmount] = useState('');
  const dropdownRef = React.useRef(null);
  const { updateSellSubmissionStatus, sendOffer, isUpdatingSellSubmission } =
    useDashboardStore();

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
      await updateSellSubmissionStatus(submission.id, newStatus);
      setIsDropDownOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSendOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    try {
      await sendOffer(submission.id, parseFloat(offerAmount));
      setOfferAmount('');
      setIsDropDownOpen(false);
    } catch (error) {
      console.error('Failed to send offer:', error);
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
      Pending: { text: 'Pending', class: 'badge-warning' },
      'Offer Sent': { text: 'Offer Sent', class: 'badge-info' },
      Accepted: { text: 'Accepted', class: 'badge-success' },
      Rejected: { text: 'Rejected', class: 'badge-error' },
    };
    return statusConfig[status] || statusConfig.Pending;
  };

  const statusBadge = getStatusBadge(submission.offerStatus);
  const photos = submission.uploadPhotos || '[]';

  return (
    <div className="bg-base-100 rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{submission.fullName}</span>
              <span className={`badge ${statusBadge.class}`}>
                {statusBadge.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Car className="size-4" />
              {submission.carMake} {submission.carModel} ({submission.yearOfManufacture})
            </p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {submission.phoneNumber}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="size-3" />
                {submission.emailAddress}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(submission.createdAt)}
            </p>
          </div>

          <button
            onClick={handleDropDownClick}
            className="btn btn-circle btn-ghost btn-sm"
            disabled={isUpdatingSellSubmission}
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

        {/* Car Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3 p-3 bg-base-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Mileage</p>
              <p className="text-sm font-medium">{submission.mileageKm} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Year</p>
              <p className="text-sm font-medium">{submission.yearOfManufacture}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Condition</p>
              <p className="text-sm font-medium">{submission.condition}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Photos</p>
              <p className="text-sm font-medium">{photos.length}</p>
            </div>
          </div>
        </div>

        {submission.additionalNotes && (
          <div className="mt-2 p-3 bg-base-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Additional Notes:</p>
            <p className="text-sm">{submission.additionalNotes}</p>
          </div>
        )}

        {submission.offerAmount && (
          <div className="mt-2 p-3 bg-success/10 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Offer Amount:</p>
            <p className="text-lg font-bold text-success">
              N{parseFloat(submission.offerAmount).toLocaleString()}
            </p>
            {submission.offerSentDate && (
              <p className="text-xs text-gray-500 mt-1">
                Sent: {formatDate(submission.offerSentDate)}
              </p>
            )}
          </div>
        )}
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
        <div className="p-4 border-t space-y-3">
          {/* Send Offer */}
          {submission.offerStatus === 'Pending' && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter offer amount"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="input input-bordered flex-1"
              />
              <button
                onClick={handleSendOffer}
                className="btn btn-primary"
                disabled={isUpdatingSellSubmission}
              >
                <Send className="size-4" />
                Send Offer
              </button>
            </div>
          )}

          {/* Status Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange('Accepted')}
              className="btn btn-success btn-sm"
              disabled={
                submission.offerStatus === 'Accepted' || isUpdatingSellSubmission
              }
            >
              <CheckCircle className="size-4" />
              Accept
            </button>
            <button
              onClick={() => handleStatusChange('Rejected')}
              className="btn btn-error btn-sm"
              disabled={
                submission.offerStatus === 'Rejected' || isUpdatingSellSubmission
              }
            >
              <XCircle className="size-4" />
              Reject
            </button>
          </div>

          {/* View Photos */}
          {photos.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Uploaded Photos:</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(0, 4).map((photo, index) => (
                  <a
                    key={index}
                    href={photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={photo}
                      alt={`Car ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
              {photos.length > 4 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{photos.length - 4} more photos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSellingToUs;
