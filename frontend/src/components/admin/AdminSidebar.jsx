// src/components/Admin/AdminSidebar.jsx
import React from 'react';
import { LogOut, UserRound, X } from 'lucide-react';

const AdminSidebar = ({
  activeSection,
  setActiveSection,
  isSidebarOpen,
  closeSidebar,
}) => {
  //   const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { id: 'Overview', name: 'Overview' },
    { id: 'Listings', name: 'Listings' },
    { id: 'SellingToUs', name: 'Selling To Us' },
    { id: 'Blogs', name: 'Blogs' },
    { id: 'Staffs', name: 'Staffs' },
    { id: 'Users', name: 'Users' },
    { id: 'Newsteller', name: 'Newsteller' },
    { id: 'Comments', name: 'Comments' },
    { id: 'Reviews', name: 'Reviews' },
  ];

  // Function to handle navigation item click and close sidebar on mobile
  const handleNavigationClick = (sectionId) => {
    setActiveSection(sectionId);
    // Corrected: Call the prop directly to close the sidebar.
    // It's a function from the store that doesn't take arguments.
    closeSidebar();
  };

  return (
    <div
      className={`
                fixed inset-y-0 left-0 z-50
                w-70 bg-base-300 p-2 shadow-lg flex flex-col justify-between
                transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 lg:rounded-r-lg lg:shadow-lg
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
    >
      {/* NEW: Close button for mobile */}
      <div className="lg:hidden absolute top-4 right-4">
        <button
          className="btn btn-ghost btn-circle"
          onClick={closeSidebar} // Corrected: Call the prop directly
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      <div className="mt-15 lg:mt-5">
        {/* <h2 className="text-2xl font-bold mb-8 mt-4 lg:mt-0 font-['inter']">
          Admin Panel
        </h2> */}
        <ul className="menu rounded-box text-lg w-full">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                className={
                  activeSection === item.id
                    ? 'active font-semibold text-primary'
                    : ''
                }
                onClick={() => handleNavigationClick(item.id)}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="my-2 space-y-2">
        <button
          //   onClick={logout}
          className="btn btn-secondary text-white border-2 btn-block rounded-full shadow-md"
        >
          <UserRound />
          Profile
        </button>
        <button
          //   onClick={logout}
          className="btn btn-error btn-outline border-2 btn-block rounded-full shadow-md"
        >
          <LogOut />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
