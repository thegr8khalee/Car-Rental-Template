// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { useUserAuthStore } from '../store/useUserAuthStore';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // React Router hook for navigation
  const navigate = useNavigate();

  // Access authUser and isAdmin from the store to handle redirection if already logged in as admin
  const { authUser, isAdmin, isLoading } = useUserAuthStore();
  const { adminLogin } = useAdminAuthStore();
  // Effect to redirect if an admin is already logged in
  // This handles cases where an admin manually navigates to /admin/login while already authenticated
  React.useEffect(() => {
    if (!isLoading && authUser && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authUser, isAdmin, isLoading, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log('Form submitted with data:', formData); // Add this
    e.preventDefault();
    await adminLogin(formData);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  // If loading, show a simple loading message
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Render the login form
  return (
    <div>
      <section className="w-full sticky top-0 bg-secondary pt-16 px-4 h-16 z-50">
        <hr className="border-t border-gray-500" />
      </section>
      <div className="p-4 flex justify-center items-center h-screen bg-base-300 font-inter">
        <div className="card w-md bg-base-100 shadow-xl rounded-2xl">
          <div className="card-body p-8">
            <h2 className="card-title text-center text-3xl font-bold font-inter">
              Admin Login
            </h2>
            <p>Welcome back to the admin panel</p>

            <form onSubmit={handleSubmit} className="my-2">
              <div className="relative w-full mb-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // Floating label trick
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocused || formData.email
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Email
                </label>
                <p className="mt-1 text-sm text-red-500 hidden peer-invalid:block">
                  Enter a valid email address
                </p>
              </div>

              <div className="relative w-full mb-6">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" "
                  required
                  // minLength={8}
                  // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  title="Must be at least 8 characters, include one number, one lowercase, and one uppercase letter"
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedPassword || formData.password
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Password
                </label>
                {/* <p className="mt-1 text-sm text-red-500 hidden peer-invalid:block">
                Must be at least 8 characters, including:
                <br />• One number
                <br />• One lowercase letter
                <br />• One uppercase letter
              </p> */}
              </div>

              <div className="form-control">
                <button
                  type="submit"
                  className="w-full btn text-white btn-primary btn-lg rounded-full"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Login as Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
