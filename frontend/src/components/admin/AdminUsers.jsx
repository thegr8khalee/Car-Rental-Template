// AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../../store/useDasboardStore';
import {
  ChevronDown,
  ChevronLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Search,
} from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

const AdminUsers = ({ setActiveSection, setSelectedUser }) => {
  const {
    getUsers,
    users,
    totalUserPages,
    currentUserPage,
    isFetchingUsers,
    userError,
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState('');
  // const navigate = useNavigate();

  useEffect(() => {
    getUsers({ page: 1, limit: 10 });
  }, [getUsers]);

  const handlePageChange = (page) => {
    getUsers({ page, limit: 10, search: searchTerm });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getUsers({ page: 1, limit: 10, search: searchTerm });
  };

  if (isFetchingUsers)
    return <div className="text-center py-8">Loading...</div>;
  if (userError)
    return (
      <div className="text-center py-8 text-error">Error: {userError}</div>
    );

  return (
    <div className="bg-base-200 rounded-lg space-y-4 max-h-[60vh] overflow-y-auto">
      {/* Header with Search */}
      <div className="flex flex-col justify-between items-start sm:flex-row gap-2">
        <h1 className="text-primary font-bold flex text-xl">
          {users?.length || 0} User{users?.length > 1 ? 's' : ''}
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-3xl">
          <div className="form-control flex w-full">
            <div className="input-group flex w-full space-x-1">
              <input
                type="text"
                placeholder="Search users..."
                className="input rounded-full w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-circle btn-primary">
                <Search className="size-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Users List */}
      {users?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found.</div>
      ) : (
        users?.map((user) => (
          <UserCard
            key={user.id}
            item={user}
            setActiveSection={setActiveSection}
            setSelectedUser={setSelectedUser}
          />
        ))
      )}

      {/* Pagination */}
      {totalUserPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {totalUserPages > 3 && currentUserPage > 3 && (
            <button
              onClick={() => handlePageChange(1)}
              className="btn btn-circle btn-primary"
            >
              1
            </button>
          )}
          {currentUserPage > 1 && (
            <button
              onClick={() => handlePageChange(currentUserPage - 1)}
              className="btn btn-circle btn-primary"
            >
              <ChevronLeft className="size-5 text-white" />
            </button>
          )}
          {[...Array(totalUserPages)]
            .map((_, index) => index + 1)
            .filter(
              (page) =>
                page >= currentUserPage - 2 && page <= currentUserPage + 2
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-circle ${
                  page === currentUserPage
                    ? 'btn-primary text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          {currentUserPage < totalUserPages && (
            <button
              onClick={() => handlePageChange(currentUserPage + 1)}
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

const UserCard = ({ item, setActiveSection, setSelectedUser }) => {
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(false);
  const [dropdownHeight, setDropdownHeight] = React.useState(0);
  const dropdownRef = React.useRef(null);
  // const navigate = useNavigate();

  React.useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(dropdownRef.current.scrollHeight);
    }
  }, [isDropDownOpen]);

  const handleDropDownClick = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  const handleViewDetails = async (id) => {
    console.log('View details for user ID:', id);
    const { getUserWithDetails } = useDashboardStore.getState();
    const userWithDetails = await getUserWithDetails(id);

    if (userWithDetails) {
      setSelectedUser(userWithDetails);
      setActiveSection('user-profile');
    }
  };

  // const handleDelete = (id) => {
  //   // TODO: Implement delete functionality
  //   window.confirm('Are you sure you want to delete this user?') &&
  //     console.log('Delete user:', id);
  // };

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
          <UserIcon className="size-16 text-gray-400" />
        </div>

        {/* User Info */}
        <div className="flex-1 px-4">
          <h2 className="font-semibold text-base font-[inter] flex items-center gap-2">
            {/* <UserIcon className="size-4" /> */}
            {item.username}
          </h2>
          <div className="flex flex-col gap-1 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Mail className="size-4" />
              {item.email}
            </span>
            {item.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="size-4" />
                {item.phoneNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Calendar className="size-3" />
            Joined: {formatDate(item.createdAt)}
          </p>
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
            onClick={() => handleViewDetails(item.id)}
            className="btn btn-primary m-2 p-2 flex-1 rounded-full"
          >
            View Details
          </button>
          {/* <button
            onClick={() => handleDelete(item.id)}
            className="btn btn-outline border-primary border-2 text-primary m-2 p-2 flex-1 rounded-full"
          >
            Delete
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
