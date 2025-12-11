// AdminStaff.jsx
import React, { useEffect } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import { ChevronDown, ChevronLeft, UserPlus, Shield, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStaffStore } from '../../store/useAdminStaffStore';

const AdminStaff = () => {
  const {
    getStaffs,
    staffs,
    totalStaffPages,
    currentStaffPage,
    isFetchingStaffs,
    staffError,
  } = useDashboardStore();

  const navigate = useNavigate();

  useEffect(() => {
    getStaffs(1, 10);
  }, [getStaffs]);

  console.log(staffs);

  const handlePageChange = (page) => {
    getStaffs(page, 10);
  };

  const handleAddStaff = () => {
    navigate('/admin/staff/add');
  };

  if (isFetchingStaffs) return <div>Loading...</div>;
  if (staffError) return <div>Error: {staffError}</div>;

  return (
    <div className="bg-base-200 rounded-lg space-y-2 max-h-[60vh] overflow-y-auto">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-primary font-bold text-xl">
          {staffs?.length || 0} Staff Members
        </h1>
        <button
          onClick={handleAddStaff}
          className="btn btn-primary rounded-full flex items-center gap-2"
        >
          <UserPlus className="size-5" />
          Add New Staff
        </button>
      </div>

      {/* Staff List */}
      {staffs?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No staff members found.
        </div>
      ) : (
        staffs?.map((staff) => <StaffCard key={staff.id} item={staff} />)
      )}

      {/* Pagination */}
      {totalStaffPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {/* Go to Page 1 button */}
          {totalStaffPages > 3 && currentStaffPage > 3 && (
            <button
              onClick={() => handlePageChange(1)}
              className="btn btn-circle btn-primary"
            >
              1
            </button>
          )}
          {/* Prev Button */}
          {currentStaffPage > 1 && (
            <button
              onClick={() => handlePageChange(currentStaffPage - 1)}
              className="btn btn-circle btn-primary"
            >
              <ChevronLeft className="size-5 text-white" />
            </button>
          )}
          {/* Page Numbers */}
          {[...Array(totalStaffPages)]
            .map((_, index) => index + 1)
            .filter(
              (page) =>
                page >= currentStaffPage - 2 && page <= currentStaffPage + 2
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-circle ${
                  page === currentStaffPage
                    ? 'btn-primary text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          {/* Next Button */}
          {currentStaffPage < totalStaffPages && (
            <button
              onClick={() => handlePageChange(currentStaffPage + 1)}
              className="btn rounded-full btn-primary"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const StaffCard = ({ item }) => {
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(false);
  const [dropdownHeight, setDropdownHeight] = React.useState(0);
  const dropdownRef = React.useRef(null);
  const { deleteStaff, isLoading } = useAdminStaffStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight);
    }
  }, [isDropDownOpen]);

  const handleDropDownClick = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  const handleEdit = (id) => {
    navigate(`/admin/staff/edit/${id}`);
  };

  const handleDelete = (id) => {
    // TODO: Implement delete functionality
    window.confirm('Are you sure you want to delete this staff member?') &&
      deleteStaff(id);
      
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-600';
      case 'editor':
        return 'bg-blue-100 text-blue-600';
      case 'moderator':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatRole = (role) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-xl bg-base-100 shadow-sm">
      <div className="w-full flex items-center justify-between p-4">
        {/* Avatar */}
        <div className="avatar placeholder">
          <div className="rounded-full w-16 h-16">
            <img
              src={item.avatar}
              alt={item.name}
              className="rounded-full h-full w-full"
            />
          </div>
        </div>

        {/* Staff Info */}
        <div className="flex-1 px-4">
          <h2 className="font-semibold text-base font-[inter] flex items-center gap-2">
            {item.name}
            <span
              className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(
                item.role
              )}`}
            >
              <Shield className="size-3 inline mr-1" />
              {formatRole(item.role)}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Mail className="size-4" />
            {item.email}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Joined: {formatDate(item.createdAt)}
          </p>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`badge rounded-full ${
              item.isActive ? 'badge-success' : 'badge-error'
            }`}
          >
            {item.isActive ? '' : ''}
          </span>
        </div>

        {/* Dropdown Button */}
        <button
          onClick={handleDropDownClick}
          className="btn btn-circle btn-ghost ml-2"
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

      {/* Dropdown Actions */}
      <div
        ref={dropdownRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isDropDownOpen ? `${dropdownHeight}px` : '0px',
          opacity: isDropDownOpen ? 1 : 0,
        }}
      >
        <div className="flex p-2 gap-2">
          <button
            onClick={() => handleEdit(item.id)}
            className="btn btn-primary m-2 p-2 flex-1 rounded-full"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="btn btn-outline border-primary border-2 text-primary m-2 p-2 flex-1 rounded-full"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStaff;
