// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../store/useAuthStore';
// import { usePasswordStore } from '../store/usePasswordStore'; // NEW: Import usePasswordStore
import {
  Loader2,
  Edit,
  Lock,
  Trash2,
  EyeOff,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast'; // Ensure toast is imported for local messages
import { useUserAuthStore } from '../store/useUserAuthStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    authUser,
    isLoading,
    isUpdatingProfile,
    // profileUpdateError, // Removed as toast handles errors directly from store
    updateProfile,
    logout,
    deleteAccount,
    isChangingPassword,
    changePassword,
  } = useUserAuthStore();

  // NEW: From usePasswordStore
  // const { isChangingPassword, changePassword } = usePasswordStore();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [successMessage, setSuccessMessage] = useState(''); // Removed, toast handles this

  // NEW: State for Change Password form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !authUser) {
      navigate('/login');
    } else if (authUser) {
      setUsername(authUser.username || '');
      setEmail(authUser.email || '');
      setPhoneNumber(authUser.phoneNumber || '');
    }
  }, [authUser, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setSuccessMessage(''); // Clear previous success messages

    const updatedData = { username, email, phoneNumber };
    // Only send fields that have changed or are explicitly provided
    // The backend should handle which fields to update based on what's sent
    await updateProfile(updatedData);

    // Toast messages are now handled by the useAuthStore's updateProfile action.
    // setSuccessMessage('Profile updated successfully!'); // No longer needed here
    setIsEditing(false); // Exit edit mode on success
  };

  // NEW: Handle Change Password Submission
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    // Call the changePassword action from usePasswordStore
    await changePassword(oldPassword, newPassword);

    // Clear password fields after attempt
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowChangePasswordForm(false); // Close form after attempt (success or failure)
  };

  const handleLogOut = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      await deleteAccount();
      navigate('/');
    }
  };

  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPhone, setIsFocusedPhone] = useState(false);
  const [isFocusedOldPassword, setIsFocusedOldPassword] = useState(false);
  const [isFocusedNewPassword, setIsFocusedNewPassword] = useState(false);
  const [isFocusedConfirmNewPassword, setIsFocusedConfirmNewPassword] =
    useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pt-16 font-inter">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-bold font-[inter] mb-8 text-center">
          My Profile
        </h1>

        <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded-none shadow-xl">
          {/* Error and Success messages are now handled by react-hot-toast directly from store actions */}
          {/* {profileUpdateError && (
            <div role="alert" className="alert alert-error mb-4">
              <span>Error: {profileUpdateError}</span>
            </div>
          )}
          {successMessage && (
            <div role="alert" className="alert alert-success mb-4">
              <span>{successMessage}</span>
            </div>
          )} */}

          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-outline btn-primary rounded-full"
            >
              {isEditing ? (
                'Cancel Edit'
              ) : (
                <>
                  <Edit size={18} className="mr-2 font-[inter]" /> Edit Profile
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative w-full mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocusedName(true)}
                onBlur={() => setIsFocusedName(false)}
                disabled={!isEditing}
                className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder=" " // Floating label trick
                required
                // disabled={!isEditing}
              />
              <label
                className={`absolute left-3 transition-all duration-300
      ${
        isFocusedName || username
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-5 text-lg'
      }
    `}
              >
                Name Surname
              </label>
            </div>

            <div className="relative w-full mb-4">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
                disabled={!isEditing}
                className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder=" " // Floating label trick
                required
                // disabled={!isEditing}
              />
              <label
                className={`absolute left-3 transition-all duration-300
      ${
        isFocusedEmail || email
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-5 text-lg'
      }
    `}
              >
                Email
              </label>
            </div>

            <div className="relative w-full mb-4">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => setIsFocusedPhone(true)}
                onBlur={() => setIsFocusedPhone(false)}
                disabled={!isEditing}
                className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder=" " // Floating label trick
                required
                // disabled={!isEditing}
              />
              <label
                className={`absolute left-3 transition-all duration-300
      ${
        isFocusedPhone || phoneNumber
          ? 'text-xs top-2 text-gray-500'
          : 'text-gray-400 top-5 text-lg'
      }
    `}
              >
                Phone Number
              </label>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="submit"
                  className="btn btn-primary text-white font-[inter] rounded-full"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* NEW: Change Password Button */}
          <div className="w-full border-t border-base-200 mt-6">
            <button
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
              className="btn w-full btn-outline btn-info rounded-full"
            >
              <Lock size={18} className="mr-2" />
              {showChangePasswordForm
                ? 'Hide Change Password'
                : 'Change Password'}
            </button>
          </div>

          {/* NEW: Change Password Form (Conditionally Rendered) */}
          {showChangePasswordForm && (
            <div className="mt-6 p-4 bg-base-200 rounded-2xl shadow-inner">
              <h3 className="text-xl font-semibold mb-4 text-center font-[inter]">
                Change Your Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="relative w-full mb-6">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onFocus={() => setIsFocusedOldPassword(true)}
                    onBlur={() => setIsFocusedOldPassword(false)}
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
                        isFocusedOldPassword || oldPassword
                          ? 'text-xs top-2 text-gray-500'
                          : 'text-gray-400 top-4 text-lg'
                      }
                    `}
                  >
                    Old Password
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
                <div className="relative w-full mb-6">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setIsFocusedNewPassword(true)}
                    onBlur={() => setIsFocusedNewPassword(false)}
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
                        isFocusedNewPassword || newPassword
                          ? 'text-xs top-2 text-gray-500'
                          : 'text-gray-400 top-4 text-lg'
                      }
                    `}
                  >
                    New Password
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
                <div className="relative w-full mb-6">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    onFocus={() => setIsFocusedConfirmNewPassword(true)}
                    onBlur={() => setIsFocusedConfirmNewPassword(false)}
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
                        isFocusedConfirmNewPassword || confirmNewPassword
                          ? 'text-xs top-2 text-gray-500'
                          : 'text-gray-400 top-4 text-lg'
                      }
                    `}
                  >
                    Confirm Password
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
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary font-[inter] text-white rounded-full"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Update Password</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logout and Delete Account Buttons */}
          <div className="w-full pt- border-t border-base-200 mt-6">
            <button
              onClick={() => handleLogOut()}
              className="btn w-full btn-outline btn-error rounded-full"
            >
              Logout
            </button>
          </div>
          <div className="w-full pt-6">
            <button
              onClick={() => handleDeleteAccount()}
              className="btn w-full btn-error rounded-full"
            >
              <Trash2 />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
