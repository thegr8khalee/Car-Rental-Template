// src/pages/AdminSignupPage.jsx
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useUserAuthStore } from '../store/useUserAuthStore'; // Import your Zustand auth store
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    anonymousId: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // React Router hook for navigation
  //   const navigate = useNavigate();

  // Access authUser and isAdmin from the store to handle redirection if already logged in as admin
  const { signup, isLoading } = useUserAuthStore();
  // Effect to redirect if an admin is already logged in
  // This handles cases where an admin manually navigates to /admin/login while already authenticated

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPhone, setIsFocusedPhone] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  //   const [isFocusedAnonymousId, setIsFocusedAnonymousId] = useState(false);

  // If loading, show a simple loading message
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
        <div className="card w-xl bg-base-100 shadow-xl rounded-2xl">
          <div className="card-body p-8">
            <h2 className="font-[inter] card-title text-3xl font-bold">
              Welcome to Company Name
            </h2>
            <p>Please fill in the details below to create an account.</p>

            <form onSubmit={handleSubmit}>
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  onFocus={() => setIsFocusedName(true)}
                  onBlur={() => setIsFocusedName(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // Floating label trick
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedName || formData.fullName
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Name Surname
                </label>
              </div>

              <div className="relative w-full mb-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onFocus={() => setIsFocusedEmail(true)}
                  onBlur={() => setIsFocusedEmail(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // Floating label trick
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedEmail || formData.email
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Email
                </label>
                <p className="validator-hint hidden">
                  Enter a valid email address
                </p>
              </div>
              <div className="relative w-full mb-4">
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  onFocus={() => setIsFocusedPhone(true)}
                  onBlur={() => setIsFocusedPhone(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary tabular-nums"
                  placeholder=" "
                  pattern="[0-9]*"
                  minLength={10}
                  maxLength={14}
                  title="Must be at least 10 digits"
                  required
                />
                <label
                  className={`absolute left-3 transition-all duration-300
      ${
        isFocusedPhone || formData.phoneNumber
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-4 text-lg'
      }
    `}
                >
                  Phone number
                </label>
                <p className="validator-hint hidden">
                  Must be at least 10 digits
                </p>
              </div>

              <div className="relative w-full mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                  className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder=" " // floating label trick
                  required
                  minLength={8}
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
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
                <button
                  type="button"
                  className="absolute top-6 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
                <p className="validator-hint hidden">
                  Must be more than 8 characters, including number, lowercase
                  letter, uppercase letter
                </p>
              </div>

              <div className="form-control">
                <div className="flex mb-1">
                  <p className="">
                    By clicking on sign Up, you agree to our
                    <span className="pl-2">
                      <a href="/privacy" className="text-info">
                        Privacy Policy
                      </a>
                    </span>{' '}
                    and
                    <span className="pl-2">
                      <a href="/cookie-policy" className="text-info">
                        Cookie Policy
                      </a>
                    </span>
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full border-0 font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition duration-200 text-white text-sm font-[inter]"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Sign Up'
                  )}
                </button>
                <div className="w-full text-center mt-2">
                  <Link to="/profile" className="hover:underline font-[inter]">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
