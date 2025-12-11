// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminDashboardContent from '../components/admin/AdminDashboardContent';
import AdminSidebar from '../components/admin/AdminSidebar';
import { PanelLeftOpen } from 'lucide-react';
import AdminListings from '../components/admin/AdminListings';
import AdminBlogs from '../components/admin/AdminBlogs';
import AdminStaff from '../components/admin/AdminStaff';
import AdminUsers from '../components/admin/AdminUsers';
import AdminNewsTeller from '../components/admin/AdminNewsTeller';
import AdminComments from '../components/admin/AdminComments';
import Adminreviews from '../components/admin/Adminreviews';
import AdminSellingToUs from '../components/admin/AdminSellingToUs';
import UserDetailPage from '../components/admin/UserDetailPAge';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // For user detail view

  // Read from URL when page loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, []);

  // Function to update state + URL together
  const handleSetActiveSection = (section) => {
    setActiveSection(section);
    const params = new URLSearchParams(window.location.search);
    params.set('section', section);
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params}`
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <AdminDashboardContent setActiveSection={handleSetActiveSection} />
        );
      case 'Listings':
        return <AdminListings />;
      case 'SellingToUs':
        return <AdminSellingToUs />;
      case 'Blogs':
        return <AdminBlogs />;
      case 'Staffs':
        return <AdminStaff />;
      case 'Users':
        return <AdminUsers setActiveSection={handleSetActiveSection} setSelectedUser={setSelectedUser} />;
      case 'Newsteller':
        return <AdminNewsTeller />;
      case 'Comments':
        return <AdminComments />;
      case 'Reviews':
        return <Adminreviews />;
      case 'user-profile':
        return <UserDetailPage user={selectedUser} setActiveSection={handleSetActiveSection} />;
      default:
        return (
          <AdminDashboardContent setActiveSection={handleSetActiveSection} />
        );
    }
  };

  return (
    <div className="pt-13 flex h-screen bg-base-300 rounded-none overflow-x-hidden font-inter">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        ></div>
      )}

      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      <div className="w-screen flex-1 sm:p-4 lg:p-8 rounded-none overflow-y-scroll">
        
        <button
          className="btn lg:hidden bg-transparent my-4 btn-circle"
          onClick={() => setIsSidebarOpen(true)}
        >
          <PanelLeftOpen />
        </button>

        <div className="bg-base-200 p-4 lg:p-6 rounded-2xl shadow-xl overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
